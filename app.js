// my-frontend/App.js
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { api } from "./api/api";

export default function App() {
  const [message, setMessage] = useState("");
  const HTTP_STATUSES = {
    OK: 200,
  };

  const handleGet = async () => {
    const response = await api.getHello();
    if (response.status === HTTP_STATUSES.OK) {
      console.log(response.data);
      setMessage("Types fetched successfully!");
      // const mapped = response.data.map((e) => {
      //   return { value: e, label: e };
      // });
      // setObjectTypes(mapped);
    }
  };

  useEffect(() => {
    handleGet();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{message || "Loading..."}</Text>
    </View>
  );
}
