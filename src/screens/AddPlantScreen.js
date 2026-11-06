import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ScreenContainer from "../components/ScreenContainer";
import { usePlants } from "../context/PlantsContext";
import { schedulePlantReminder } from "../services/notificationService";

export default function AddPlantScreen({ navigation, route }) {
  const plant = route.params?.plant;
  const { createPlant, updatePlant, operationLoading } = usePlants();
  const defaultCareDate = new Date();
  defaultCareDate.setDate(defaultCareDate.getDate() + 1);
  defaultCareDate.setHours(9, 0, 0, 0);
  const [name, setName] = useState(plant?.name ?? "");
  const [species, setSpecies] = useState(plant?.species ?? "");
  const [wateringFrequency, setWateringFrequency] = useState(
    plant?.wateringFrequency ? String(plant.wateringFrequency) : "",
  );
  const [nextCareDate, setNextCareDate] = useState(
    plant?.nextCareDate ? new Date(plant.nextCareDate) : defaultCareDate,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState(plant?.imageUri ?? null);
  const [errors, setErrors] = useState({});

  const formatDate = (date) => date.toLocaleDateString("pt-BR");

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à galeria para adicionar uma foto da planta.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      exif: false,
      mediaTypes: ["images"],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      Haptics.selectionAsync();
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à câmera para fotografar sua planta.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      exif: false,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      Haptics.selectionAsync();
    }
  };

  const handleSave = async () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Informe o nome da planta.";
    if (!species.trim()) nextErrors.species = "Informe a espécie da planta.";
    if (!wateringFrequency.trim())
      nextErrors.wateringFrequency = "Informe a frequência de rega.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    try {
      const data = {
        name: name.trim(),
        species: species.trim(),
        wateringFrequency: wateringFrequency.trim(),
        nextCare: formatDate(nextCareDate),
        nextCareDate: nextCareDate.toISOString(),
        imageUri,
      };
      if (plant?.id) {
        await updatePlant(plant.id, data);
      } else {
        await createPlant(data);
      }
      Alert.alert(
        plant ? "Planta atualizada!" : "Planta cadastrada!",
        `${data.name} agora faz parte do seu jardim.`,
        [{ text: "Continuar", onPress: () => navigation.goBack() }],
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      schedulePlantReminder({ plantName: data.name, date: nextCareDate }).catch((notificationError) => {
        console.warn("Não foi possível agendar o lembrete:", notificationError);
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a planta. Tente novamente.");
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.icon}>
            <MaterialCommunityIcons accessible={false} name="flower" size={44} color="#2F6B45" />
          </View>
          <View style={styles.photoActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={imageUri ? "Trocar foto pela galeria" : "Adicionar foto pela galeria"}
              accessibilityHint="Abre a galeria de fotos do aparelho"
              onPress={handlePickImage}
              style={({ pressed }) => [styles.photoButton, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons accessible={false} name="image-outline" size={20} color="#2F6B45" />
              <Text accessible={false} style={styles.photoButtonText}>Galeria</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={imageUri ? "Trocar foto pela câmera" : "Tirar foto da planta"}
              accessibilityHint="Abre a câmera do aparelho"
              onPress={handleTakePhoto}
              style={({ pressed }) => [styles.photoButton, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons accessible={false} name="camera-outline" size={20} color="#2F6B45" />
              <Text accessible={false} style={styles.photoButtonText}>Câmera</Text>
            </Pressable>
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            {plant ? "Editar planta" : "Adicionar planta"}
          </Text>
          <Text style={styles.description}>
            Preencha os dados abaixo para acompanhar os cuidados da sua planta.
          </Text>

          <Text style={styles.label}>Nome da planta *</Text>
          <TextInput
            accessibilityLabel="Nome da planta, campo obrigatório"
            accessibilityHint="Digite o nome pelo qual você identifica a planta"
            autoCapitalize="words"
            maxLength={50}
            onChangeText={(value) => {
              setName(value);
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            placeholder="Ex.: Jiboia"
            placeholderTextColor="#9AA99C"
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
          />
          {!!errors.name && (
            <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.error}>
              {errors.name}
            </Text>
          )}

          <Text style={styles.label}>Espécie *</Text>
          <TextInput
            accessibilityLabel="Espécie da planta, campo obrigatório"
            accessibilityHint="Digite a espécie ou nome científico da planta"
            autoCapitalize="words"
            maxLength={80}
            onChangeText={(value) => {
              setSpecies(value);
              if (errors.species) setErrors({ ...errors, species: "" });
            }}
            placeholder="Ex.: Epipremnum aureum"
            placeholderTextColor="#9AA99C"
            style={[styles.input, errors.species && styles.inputError]}
            value={species}
          />
          {!!errors.species && (
            <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.error}>{errors.species}</Text>
          )}

          <Text style={styles.label}>Frequência de rega *</Text>
          <TextInput
            accessibilityLabel="Frequência de rega em dias, campo obrigatório"
            accessibilityHint="Digite quantos dias devem passar entre as regas"
            keyboardType="number-pad"
            maxLength={3}
            onChangeText={(value) => {
              setWateringFrequency(value.replace(/[^0-9]/g, ""));
              if (errors.wateringFrequency)
                setErrors({ ...errors, wateringFrequency: "" });
            }}
            placeholder="Ex.: 7 dias"
            placeholderTextColor="#9AA99C"
            style={[
              styles.input,
              errors.wateringFrequency && styles.inputError,
            ]}
            value={wateringFrequency}
          />
          <Text accessible={false} style={styles.helper}>
            Informe a quantidade de dias entre cada rega.
          </Text>
          {!!errors.wateringFrequency && (
            <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.error}>{errors.wateringFrequency}</Text>
          )}

          <Text style={styles.label}>Próximo cuidado *</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Próximo cuidado: ${formatDate(nextCareDate)}`}
            accessibilityHint="Abre o seletor de data"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateInput}
          >
            <Text accessible={false} style={styles.dateText}>{formatDate(nextCareDate)}</Text>
            <MaterialCommunityIcons
              accessible={false}
              name="calendar-month-outline"
              size={22}
              color="#2F6B45"
            />
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              minimumDate={new Date()}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) setNextCareDate(date);
              }}
              value={nextCareDate}
            />
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={plant ? "Salvar alterações da planta" : "Salvar nova planta"}
            accessibilityHint="Valida os campos e salva os dados da planta"
            accessibilityState={{ disabled: operationLoading }}
            disabled={operationLoading}
            onPress={handleSave}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            {operationLoading ? (
              <ActivityIndicator accessible={false} color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Salvar planta</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 24, paddingBottom: 40 },
  icon: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#E4F1E5",
    borderRadius: 24,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
  photoButton: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    marginTop: 12,
    padding: 8,
  },
  photoActions: { alignSelf: "center", flexDirection: "row", gap: 12, marginTop: 4 },
  photoButtonText: {
    color: "#2F6B45",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  title: {
    color: "#183B25",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  description: {
    color: "#6E7D70",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
    marginTop: 8,
    textAlign: "center",
  },
  label: {
    color: "#183B25",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8E5D9",
    borderRadius: 12,
    borderWidth: 1,
    color: "#183B25",
    fontSize: 15,
    padding: 14,
  },
  inputError: { borderColor: "#C65353" },
  error: { color: "#A33A3A", fontSize: 12, marginTop: 5 },
  helper: { color: "#7B8D7D", fontSize: 12, marginTop: 5 },
  dateInput: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D8E5D9",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
  },
  dateText: { color: "#183B25", fontSize: 15 },
  button: {
    backgroundColor: "#2F6B45",
    borderRadius: 14,
    marginTop: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.75 },
});
