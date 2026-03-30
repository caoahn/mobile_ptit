from fastapi import APIRouter, HTTPException
import numpy as np

from core.log import logger
from core.schemas import(
    UserProfileRequest,
    UpdateBatchUser
)
from db.conn import get_db_connection

router = APIRouter(prefix="/user", tags=["User"])

MACHING_USER_FEED = {
    "share": 10,
    "save": 8,
    "like": 5,
    "dwell_10s": 3,
    "click": 2,
    "skip": -5
}

EMBEDDING_DIM = 512
MERGE_ALPHA = 0.5


# ==================== WORKER FUNCTION ====================
def normalize_vector(vec: np.ndarray) -> np.ndarray:
    """
    Normalize a vector to unit length.
    Args:
        vec (np.ndarray): Input vector
    Returns:
        np.ndarray: Normalized vector
    """
    norm = np.linalg.norm(vec)
    if norm == 0:
        return vec
    return vec / norm

def parse_embedding(embedding):
    if embedding is None:
        return None
    if isinstance(embedding, str):
        embedding = embedding.strip("[]")
        if not embedding:
            return np.zeros(EMBEDDING_DIM, dtype=np.float32)
        return np.array([float(x) for x in embedding.split(",")], dtype=np.float32)
    return np.asarray(embedding, dtype=np.float32)

def to_pgvector_text(vec: np.ndarray) -> str:
    # pgvector accepts string literal format like: [0.1,0.2,...]
    return "[" + ",".join(map(str, vec.tolist())) + "]"

def log_user_interactions(data: UserProfileRequest):
    """
    Worker function to log user interactions (runs in Celery worker).
    Args:
        data (UserProfileRequest): Dữ liệu người dùng và tương tác
    """
    logger.info(f"[Worker] Logging interactions for user: {data.user_id} with {len(data.interactions)} interactions")
    user_id = data.user_id
    interactions = data.interactions

    db_conn = get_db_connection()
    try:
        with db_conn.cursor() as cursor:
            # Query existing short-term embedding only once.
            cursor.execute(
                "SELECT short_term_embedding FROM user_vector WHERE user_id = %s",
                (user_id,)
            )
            user_row = cursor.fetchone()

            if user_row and user_row[0] is not None:
                old_embedding = parse_embedding(user_row[0])
            else:
                old_embedding = None

            if len(interactions) == 0:
                logger.info(f"No interactions for user_id={user_id}. Keep old embedding unchanged.")
                return

            recipe_ids = list({interaction.item_id for interaction in interactions})
            cursor.execute(
                "SELECT recipe_id, embedding FROM recipe_vector WHERE recipe_id = ANY(%s)",
                (recipe_ids,)
            )
            recipe_rows = cursor.fetchall()
            recipe_embedding_map = {
                row[0]: parse_embedding(row[1])
                for row in recipe_rows
                if row[1] is not None
            }

            weighted_sum = np.zeros(EMBEDDING_DIM, dtype=np.float32)
            total_score = 0.0

            for interaction in interactions:
                score = float(MACHING_USER_FEED.get(interaction.event, 0.0))
                if score == 0:
                    logger.warning(f"Unknown or zero-weight event: {interaction.event} for user_id={user_id}, item_id={interaction.item_id}")
                recipe_embedding = recipe_embedding_map.get(interaction.item_id)

                logger.debug(
                    f"Processing interaction: user_id={user_id}, item_id={interaction.item_id}, "
                    f"event={interaction.event}, score={score}"
                )

                if recipe_embedding is None:
                    logger.warning(f"Missing recipe embedding for item_id={interaction.item_id} (user_id={user_id})")
                    continue

                weighted_sum += score * recipe_embedding
                total_score += score


            if total_score == 0:
                logger.warning(f"user {user_id} has no valid interactions (total_score=0), embedding will be zero vector")
            new_embedding = weighted_sum
            if total_score > 0:
                new_embedding = weighted_sum / total_score

            new_embedding = normalize_vector(new_embedding)
            new_embedding_text = to_pgvector_text(new_embedding)

            if old_embedding is None:
                final_embedding = new_embedding
                cursor.execute(
                    "INSERT INTO user_vector (user_id, long_term_embedding, short_term_embedding) VALUES (%s, %s::vector, %s::vector)",
                    (user_id, to_pgvector_text(np.zeros(EMBEDDING_DIM, dtype=np.float32)), new_embedding_text)
                )
                logger.info(f"Inserted new embedding for new user_id: {user_id}")
            else:
                old_embedding = normalize_vector(old_embedding)
                merged_embedding = MERGE_ALPHA * old_embedding + (1.0 - MERGE_ALPHA) * new_embedding
                final_embedding = normalize_vector(merged_embedding)
                final_embedding_text = to_pgvector_text(final_embedding)

                cursor.execute(
                    "UPDATE user_vector SET short_term_embedding = %s::vector, updated_at = NOW() WHERE user_id = %s",
                    (final_embedding_text, user_id)
                )
                logger.info(f"Updated embedding for existing user_id: {user_id}")

        db_conn.commit()
    except Exception:
        db_conn.rollback()
        raise
    finally:
        db_conn.close()

def get_all_user_ids():
    """
    Lấy tất cả user_id từ bảng user_vector.
    Returns:
        list: Danh sách user_id
    """
    db_conn = get_db_connection()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT user_id FROM user_vector")
            rows = cursor.fetchall()
            user_ids = [row[0] for row in rows]
            logger.info(f"Retrieved {len(user_ids)} user_ids from database")
            return user_ids
    except Exception as e:
        logger.error(f"Error retrieving user_ids: {e}")
        return []
    finally:
        db_conn.close()

def get_personalized_top_k_recipe(user_id: int, k: int = 10):
    """
    Lấy top K recipe được recommend cho một user cụ thể dựa trên embedding của user đó.

    Args:
        user_id (int): ID của user
        k (int): Số lượng recipe cần lấy
    Returns:
        list: Danh sách [(recipe_id, similarity_score)] được sắp xếp theo similarity từ cao xuống thấp
    """
    db_conn = get_db_connection()
    try:
        with db_conn.cursor() as cursor:
            # Lấy short_term_embedding của user
            cursor.execute(
                "SELECT short_term_embedding FROM user_vector WHERE user_id = %s",
                (user_id,)
            )
            result = cursor.fetchone()
            if not result or result[0] is None:
                logger.warning(f"No embedding found for user_id: {user_id}")
                return []

            user_embedding = parse_embedding(result[0])
            user_embedding = normalize_vector(user_embedding)
            user_embedding_text = to_pgvector_text(user_embedding)

            if np.linalg.norm(user_embedding) == 0:
                logger.warning(f"user {user_id} has zero embedding, fallback to default recommendations")
                cursor.execute(
                    "SELECT recipe_id FROM recipe_vector LIMIT %s",
                    (k,)
                )
                fallback = [(row[0], 0.0) for row in cursor.fetchall()]
                return fallback

            # Vector similarity search using ivfflat index
            # <=> operator: cosine distance (dùng với vector_cosine_ops)
            cursor.execute(
                """
                SELECT recipe_id, embedding <=> %s::vector AS distance
                FROM recipe_vector
                ORDER BY distance ASC
                LIMIT %s
                """,
                (user_embedding_text, k)
            )
            results = cursor.fetchall()

            # Convert distance to similarity score (1 - distance)
            recommendations = [(row[0], float(1.0 - row[1])) for row in results]
            logger.info(f"Got top {len(recommendations)} recipes for user_id: {user_id}")
            return recommendations
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting personalized top k recipes for user {user_id}: {e}")
        return []
    finally:
        db_conn.close()


# ==================== ENDPOINTS ====================

@router.post("/UpdateBatchUser")
async def log_interactions(request: UpdateBatchUser):
    """
    Endpoint để log batch interactions của người dùng.
    Args:
        request (UpdateBatchUser): Dữ liệu batch interactions
    Returns:
        dict: Kết quả cập nhật
    """
    try:
        logger.info(f"Update {len(request.users)} users' interactions")
        for user_data in request.users:
            log_user_interactions(user_data)

        return {
            "success": True,
            "updated_users": len(request.users)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update batch user interactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user embeddings")

@router.get("/top-recipes")
async def get_top_recipes(k: int = 10):
    """
    Lấy top K recipe được recommend cho tất cả user.

    Args:
        k (int, query): Số lượng recipe cần lấy (mặc định: 10)
    Returns:
        dict: {
            "success": bool,
            "recipes": [(recipe_id, similarity_score), ...],
            "count": int
        }
    """
    try:
        if k <= 0:
            raise HTTPException(status_code=400, detail="k must be greater than 0")

        list_user_ids = get_all_user_ids()
        if not list_user_ids:
            logger.warning("No users found in database to get top recipes for")
            return {
                "success": True,
                "result": [],
                "count": 0
            }
        recommendations = []
        for user_id in list_user_ids:
            recommendation = get_personalized_top_k_recipe(user_id=user_id, k=k)  # Pass a default user_id or handle this case appropriately
            result = {
                "user_id": user_id,
                "recommendations": recommendation
            }
            recommendations.append(result)

        return {
            "success": True,
            "result": recommendations,
            "count": len(recommendations)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get top recipes: {e}")
        raise HTTPException(status_code=500, detail="Failed to get top recipes")

@router.get("/top-recipes/{user_id}")
async def get_top_recipes_for_user(user_id: int, k: int = 10):
    """
    Lấy top K recipe được recommend cho một user cụ thể.

    Args:
        user_id (int, path): ID của user
        k (int, query): Số lượng recipe cần lấy (mặc định: 10)
    Returns:
        dict: {
            "success": bool,
            "user_id": int,
            "recipes": [(recipe_id, similarity_score), ...],
            "count": int
        }
    """
    try:
        if k <= 0:
            raise HTTPException(status_code=400, detail="k must be greater than 0")

        recommendations = get_personalized_top_k_recipe(user_id=user_id, k=k)
        result = {
            "user_id": user_id,
            "recommendations": recommendations
        }
        return {
            "success": True,
            "result": result,
            "count": len(recommendations)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get top recipes for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get top recipes for user")