import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ScreenContainer from "../components/ScreenContainer";
import PlantCareCard from "../components/PlantCareCard";
import plantCatalogData from "../constants/plantCatalogData";
import { usePlants } from "../context/PlantsContext";
import { schedulePlantReminder } from "../services/notificationService";

export default function AddPlantScreen({ navigation, route }) {
  const plant = route.params?.plant;
  const catalogPlant = route.params?.catalogPlant;
  const { createPlant, updatePlant, operationLoading } = usePlants();
  const defaultCareDate = new Date();
  defaultCareDate.setDate(defaultCareDate.getDate() + 1);
  defaultCareDate.setHours(9, 0, 0, 0);
  const [name, setName] = useState(plant?.name ?? plant?.species ?? "");
  const [species, setSpecies] = useState(plant?.species ?? plant?.name ?? "");
  const [selectedCatalogPlant, setSelectedCatalogPlant] = useState(catalogPlant ?? null);
  const [lightType, setLightType] = useState(plant?.lightType ?? catalogPlant?.lightType ?? "");
  const [environment, setEnvironment] = useState(plant?.environment ?? catalogPlant?.environment ?? "");
  const [wateringFrequency, setWateringFrequency] = useState(
    plant?.wateringFrequency ? String(plant.wateringFrequency) : catalogPlant?.wateringIntervalDays ? String(catalogPlant.wateringIntervalDays) : "",
  );
  const [nextCareDate, setNextCareDate] = useState(
    plant?.nextCareDate ? new Date(plant.nextCareDate) : defaultCareDate,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState(plant?.imageUri ?? null);
  const [errors, setErrors] = useState({});
  const [speciesModalVisible, setSpeciesModalVisible] = useState(false);
  const [customSpecies, setCustomSpecies] = useState(
    plant && !plantCatalogData.some((item) => item.name === plant.species) ? plant.species ?? "" : "",
  );
  const [customSpeciesMode, setCustomSpeciesMode] = useState(false);

  const formatDate = (date) => date.toLocaleDateString("pt-BR");
  const selectCatalogPlant = (item) => {
    setSelectedCatalogPlant(item);
    setCustomSpeciesMode(false);
    setName(item.name);
    setSpecies(item.name);
    setWateringFrequency(String(item.wateringIntervalDays));
    setLightType(item.lightType);
    setEnvironment(item.environment);
    if (errors.species) setErrors({ ...errors, species: "" });
  };

  const selectCustomSpecies = () => {
    setName("");
    setSpecies("");
    setCustomSpeciesMode(true);
    setSpeciesModalVisible(false);
    setLightType("");
    setEnvironment("");
    setWateringFrequency("");
  };

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
        lightType: lightType.trim(),
        environment: environment.trim(),
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
    } catch {
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

          <Text style={styles.label}>Nome da planta ou espécie *</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={species ? `Planta selecionada: ${species}` : "Selecionar planta ou espécie"}
            accessibilityHint="Abre a lista de espécies disponíveis"
            accessibilityState={{ expanded: speciesModalVisible }}
            onPress={() => setSpeciesModalVisible(true)}
            style={[styles.selectInput, errors.species && styles.inputError]}
          >
            <Text style={species ? styles.selectText : styles.placeholderText}>
              {species || (customSpeciesMode ? "Outra espécie" : "Selecione uma espécie")}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={22} color="#2F6B45" />
          </Pressable>
          {customSpeciesMode && (
            <TextInput
              accessibilityLabel="Nome da planta ou espécie personalizada, campo obrigatório"
              autoCapitalize="words"
              maxLength={80}
              onChangeText={(value) => {
                setCustomSpecies(value);
                setSpecies(value);
                setName(value);
                if (errors.name) setErrors({ ...errors, name: "" });
                if (errors.species) setErrors({ ...errors, species: "" });
              }}
              placeholder="Digite o nome da planta ou espécie"
              placeholderTextColor="#9AA99C"
              style={[styles.customSpeciesInput, (errors.name || errors.species) && styles.inputError]}
              value={customSpecies}
            />
          )}
          {!!errors.species && (
            <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.error}>{errors.species}</Text>
          )}
          <Modal
            animationType="slide"
            onRequestClose={() => setSpeciesModalVisible(false)}
            transparent
            visible={speciesModalVisible}
          >
            <Pressable style={styles.modalBackdrop} onPress={() => setSpeciesModalVisible(false)}>
              <Pressable style={styles.speciesModal} onPress={(event) => event.stopPropagation()}>
                <View style={styles.modalHandle} />
                <Text accessibilityRole="header" style={styles.modalTitle}>Escolha a espécie</Text>
                <Text style={styles.modalDescription}>Os cuidados serão preenchidos automaticamente.</Text>
                {plantCatalogData.map((item) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar ${item.name}`}
                    key={item.id}
                    onPress={() => {
                      selectCatalogPlant(item);
                      setSpeciesModalVisible(false);
                    }}
                    style={styles.speciesOption}
                  >
                    <MaterialCommunityIcons name={item.icon} size={22} color="#2F6B45" />
                    <View style={styles.suggestionCopy}>
                      <Text style={styles.suggestionName}>{item.name}</Text>
                      <Text style={styles.suggestionMeta}>{item.scientificName}</Text>
                    </View>
                    {species === item.name && <MaterialCommunityIcons name="check" size={21} color="#2F6B45" />}
                  </Pressable>
                ))}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Adicionar outra espécie"
                  onPress={selectCustomSpecies}
                  style={styles.speciesOption}
                >
                  <MaterialCommunityIcons name="plus-circle-outline" size={22} color="#2F6B45" />
                  <View style={styles.suggestionCopy}>
                    <Text style={styles.suggestionName}>Outra espécie</Text>
                    <Text style={styles.suggestionMeta}>Cadastrar cuidados manualmente</Text>
                  </View>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>

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

          <Text style={styles.label}>Luz e ambiente</Text>
          <View style={styles.careFields}>
            <TextInput
              accessibilityLabel="Necessidade de luz"
              onChangeText={setLightType}
              placeholder="Ex.: meia-sombra"
              placeholderTextColor="#9AA99C"
              style={[styles.input, styles.careInput]}
              value={lightType}
            />
            <TextInput
              accessibilityLabel="Ambiente da planta"
              onChangeText={setEnvironment}
              placeholder="Ex.: interno"
              placeholderTextColor="#9AA99C"
              style={[styles.input, styles.careInput]}
              value={environment}
            />
          </View>
          {lightType && environment && (
            <PlantCareCard
              environment={environment}
              fertilizationNotes={selectedCatalogPlant?.fertilizationNotes ?? "Consulte o guia para escolher o adubo ideal."}
              lightRequirement={selectedCatalogPlant?.lightRequirement}
              lightType={lightType}
              wateringIntervalDays={wateringFrequency || "?"}
            />
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
  selectInput: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#D8E5D9", borderRadius: 12, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 52, paddingHorizontal: 14 },
  selectText: { color: "#183B25", fontSize: 15 },
  placeholderText: { color: "#9AA99C", fontSize: 15 },
  customSpeciesInput: { borderBottomColor: "#D8E5D9", borderBottomWidth: 1, color: "#183B25", fontSize: 13, marginTop: 6, paddingHorizontal: 4, paddingVertical: 8 },
  suggestionCopy: { marginLeft: 10 },
  suggestionName: { color: "#183B25", fontSize: 14, fontWeight: "700" },
  suggestionMeta: { color: "#718378", fontSize: 12, marginTop: 2, textTransform: "capitalize" },
  careFields: { flexDirection: "row", gap: 8 },
  careInput: { flex: 1 },
  modalBackdrop: { backgroundColor: "rgba(10, 30, 18, 0.45)", flex: 1, justifyContent: "flex-end" },
  speciesModal: { backgroundColor: "#F7FBF6", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "85%", padding: 22 },
  modalHandle: { alignSelf: "center", backgroundColor: "#C7D8C9", borderRadius: 3, height: 5, marginBottom: 16, width: 42 },
  modalTitle: { color: "#183B25", fontSize: 22, fontWeight: "800" },
  modalDescription: { color: "#718378", fontSize: 14, marginBottom: 12, marginTop: 5 },
  speciesOption: { alignItems: "center", borderBottomColor: "#E1EDE2", borderBottomWidth: 1, flexDirection: "row", minHeight: 58, paddingVertical: 9 },
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
