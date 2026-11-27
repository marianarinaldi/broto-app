import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';

function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'Informe um endereço de e-mail válido.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já possui uma conta. Entre com sua senha.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Não foi possível conectar. Verifique sua internet.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
    default:
      return 'Não foi possível autenticar. Tente novamente.';
  }
}

export default function AuthScreen() {
  const { signIn, signUp, error: sessionError } = useAuth();
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError('Informe seu e-mail e sua senha.');
      return;
    }
    if (creatingAccount && password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      if (creatingAccount) {
        await signUp(normalizedEmail, password);
      } else {
        await signIn(normalizedEmail, password);
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.icon}>
          <MaterialCommunityIcons name="sprout" size={42} color="#2F6B45" />
        </View>
        <Text accessibilityRole="header" style={styles.title}>Bem-vinda ao Broto</Text>
        <Text style={styles.description}>
          {creatingAccount
            ? 'Crie sua conta para cuidar do seu jardim.'
            : 'Entre para acessar suas plantas e cuidados.'}
        </Text>

        <TextInput
          accessibilityLabel="E-mail"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Seu e-mail"
          placeholderTextColor="#9AA99C"
          style={styles.input}
          value={email}
        />
        <TextInput
          accessibilityLabel="Senha"
          autoCapitalize="none"
          autoComplete={creatingAccount ? 'new-password' : 'password'}
          onChangeText={setPassword}
          onSubmitEditing={submit}
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor="#9AA99C"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {!!(error || sessionError) && (
          <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.error}>
            {error || 'Não foi possível verificar sua sessão. Tente novamente.'}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={submit}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{creatingAccount ? 'Criar conta' : 'Entrar'}</Text>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={() => {
            setCreatingAccount((current) => !current);
            setError('');
          }}
          style={styles.toggle}
        >
          <Text style={styles.toggleText}>
            {creatingAccount ? 'Já tem uma conta? Entrar' : 'Ainda não tem conta? Criar conta'}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', padding: 28 },
  icon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E4F1E5',
    borderRadius: 28,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  title: { color: '#183B25', fontSize: 28, fontWeight: '800', marginTop: 24, textAlign: 'center' },
  description: { color: '#6E7D70', fontSize: 15, lineHeight: 22, marginBottom: 20, marginTop: 8, textAlign: 'center' },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8E5D9',
    borderRadius: 12,
    borderWidth: 1,
    color: '#183B25',
    fontSize: 15,
    marginTop: 12,
    padding: 15,
  },
  error: { color: '#A33A3A', fontSize: 13, marginTop: 10 },
  button: {
    alignItems: 'center',
    backgroundColor: '#2F6B45',
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 22,
    minHeight: 54,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  toggle: { alignSelf: 'center', marginTop: 18, padding: 10 },
  toggleText: { color: '#2F6B45', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
