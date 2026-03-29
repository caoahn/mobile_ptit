import psycopg2
from psycopg2.extensions import connection as PgConnection

from core.config import Config
from core.log import logger

_db_initialized = False
config = Config()


def _create_vector_tables(conn: PgConnection):
    """
    Create vector tables if they do not exist.

    - user_vector: stores long-term and short-term 512-dim embeddings per user
    - recipe_vector: stores one 512-dim embedding per recipe
    """
    # Enable vector extension
    enable_vector_sql = "CREATE EXTENSION IF NOT EXISTS vector;"

    # Drop tables if they exist with wrong schema (migration from real[] to vector)
    drop_tables_sql = """
    DROP TABLE IF EXISTS recipe_vector CASCADE;
    DROP TABLE IF EXISTS user_vector CASCADE;
    """

    create_user_vector_sql = """
    CREATE TABLE IF NOT EXISTS user_vector (
        user_id BIGINT PRIMARY KEY,
        long_term_embedding VECTOR(512) NOT NULL,
        short_term_embedding VECTOR(512) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    """

    create_recipe_vector_sql = """
    CREATE TABLE IF NOT EXISTS recipe_vector (
        recipe_id BIGINT PRIMARY KEY,
        embedding VECTOR(512) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    """

    # Create indexes for vector similarity search and timestamp queries
    create_indexes_sql = """
    CREATE INDEX IF NOT EXISTS idx_user_vector_updated_at ON user_vector (updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_recipe_vector_updated_at ON recipe_vector (updated_at DESC);
    CREATE INDEX IF NOT EXISTS recipe_embedding_idx ON recipe_vector USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    """

    # Auto-update updated_at column trigger
    create_trigger_function_sql = """
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """

    drop_triggers_sql = """
    DROP TRIGGER IF EXISTS set_updated_at_user_vector ON user_vector;
    DROP TRIGGER IF EXISTS set_updated_at_recipe_vector ON recipe_vector;
    """

    create_triggers_sql = """
    CREATE TRIGGER set_updated_at_user_vector
    BEFORE UPDATE ON user_vector
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER set_updated_at_recipe_vector
    BEFORE UPDATE ON recipe_vector
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    """

    with conn.cursor() as cursor:
        cursor.execute(enable_vector_sql)
        logger.info("Vector extension enabled")

        cursor.execute(drop_tables_sql)
        logger.info("Dropped old tables if existed")

        cursor.execute(create_user_vector_sql)
        cursor.execute(create_recipe_vector_sql)
        logger.info("Created new vector tables")

        cursor.execute(create_indexes_sql)
        logger.info("Created indexes")

        cursor.execute(create_trigger_function_sql)
        cursor.execute(drop_triggers_sql)
        logger.info("Dropped old triggers if existed")

        cursor.execute(create_triggers_sql)
        logger.info("Created new triggers")

    conn.commit()
    logger.info("Vector tables are ready: user_vector, recipe_vector (with ivfflat index and auto-update triggers)")

def init_db():
    global _db_initialized
    if _db_initialized:
        logger.info("Database already initialized, skipping initialization")
        return

    conn = psycopg2.connect(config.POSTGRES_URL)
    try:
        _create_vector_tables(conn)
    finally:
        conn.close()

    _db_initialized = True
    logger.info("Database initialized successfully")

def get_db_connection():
    init_db()
    return psycopg2.connect(config.POSTGRES_URL)