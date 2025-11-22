import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_BASE_URL } from "../../context/AuthContext";

const signupSchema = z.object({
  fullname: z.string().min(2, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"), 
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { control, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, data);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {/* Name */}
        <Controller
          control={control}
          name="fullname"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#777"
                value={value}
                onChangeText={onChange}
              />
              {errors.fullname && <Text style={styles.error}>{errors.fullname.message}</Text>}
            </View>
          )}
        />

        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#777"
                value={value}
                onChangeText={onChange}
              />
              {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#777"
                value={value}
                onChangeText={onChange}
              />
              {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
            </View>
          )}
        />

        {/* Password */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputWrapper}>
              <View style={styles.passwordBox}>
                <TextInput
                  style={styles.inputPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Password"
                  placeholderTextColor="#777"
                  value={value}
                  onChangeText={onChange}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={22}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
            </View>
          )}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Register Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.text}>
          Already have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/login")}
          >
            Login
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F242C",
    padding: 0,
  },
  card: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 25,
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: "#1F242C",
    borderRadius: 0,
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "800",
    marginBottom: 5,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 15,
    marginBottom: 25,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#2B3039",
    padding: 14,
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B3039",
    padding: 14,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  inputPassword: {
    color: "#fff",
    flex: 1,
  },
  button: {
    backgroundColor: "#1E90FF",
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "700",
  },
  error: {
    color: "#ff6b6b",
    marginTop: 4,
    fontSize: 13,
  },
  text: {
    color: "#bbb",
    textAlign: "center",
    marginTop: 15,
  },
  link: {
    color: "#1E90FF",
    fontWeight: "700",
  },
});