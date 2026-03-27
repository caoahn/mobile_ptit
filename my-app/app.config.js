export default ({ config }) => {
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": process.env.EXPO_PUBLIC_IOS_URL_SCHEME
        }
      ],
      "expo-web-browser"
    ]
  };
};