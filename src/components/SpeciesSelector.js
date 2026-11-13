import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SpeciesSelector({ items, selected, visible, onOpen, onClose, onSelect, onCustom }) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={selected ? `Planta selecionada: ${selected}` : 'Selecionar planta ou espécie'}
        accessibilityHint="Abre a lista de espécies disponíveis"
        accessibilityState={{ expanded: visible }}
        onPress={onOpen}
        style={styles.select}
      >
        <Text style={selected ? styles.value : styles.placeholder}>{selected || 'Selecione uma espécie'}</Text>
        <MaterialCommunityIcons name="chevron-down" size={22} color="#2F6B45" />
      </Pressable>
      <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.handle} />
            <Text accessibilityRole="header" style={styles.title}>Escolha a espécie</Text>
            <Text style={styles.description}>Os cuidados recomendados serão preenchidos automaticamente.</Text>
            {items.map((item) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Selecionar ${item.name}`}
                key={item.id}
                onPress={() => onSelect(item)}
                style={styles.option}
              >
                <MaterialCommunityIcons name={item.icon} size={22} color="#2F6B45" />
                <View style={styles.copy}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>{item.scientificName}</Text>
                </View>
                {selected === item.name && <MaterialCommunityIcons name="check" size={21} color="#2F6B45" />}
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" onPress={onCustom} style={styles.option}>
              <MaterialCommunityIcons name="plus-circle-outline" size={22} color="#2F6B45" />
              <View style={styles.copy}>
                <Text style={styles.name}>Outra espécie</Text>
                <Text style={styles.meta}>Cadastrar cuidados manualmente</Text>
              </View>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  select: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#D8E5D9', borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 52, paddingHorizontal: 14 },
  value: { color: '#183B25', fontSize: 15 },
  placeholder: { color: '#9AA99C', fontSize: 15 },
  backdrop: { backgroundColor: 'rgba(10, 30, 18, 0.45)', flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#F7FBF6', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', padding: 22 },
  handle: { alignSelf: 'center', backgroundColor: '#C7D8C9', borderRadius: 3, height: 5, marginBottom: 16, width: 42 },
  title: { color: '#183B25', fontSize: 22, fontWeight: '800' },
  description: { color: '#718378', fontSize: 14, marginBottom: 12, marginTop: 5 },
  option: { alignItems: 'center', borderBottomColor: '#E1EDE2', borderBottomWidth: 1, flexDirection: 'row', minHeight: 58, paddingVertical: 9 },
  copy: { flex: 1, marginLeft: 10 },
  name: { color: '#183B25', fontSize: 14, fontWeight: '700' },
  meta: { color: '#718378', fontSize: 12, marginTop: 2 },
});
