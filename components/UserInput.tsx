import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

interface UserInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  validate?: (text: string) => true | string;
  showLabel?: boolean;
  placeholder?: string;
}

const UserInput: React.FC<UserInputProps> = ({
  label,
  value,
  onChangeText,
  validate,
  showLabel = true,
  placeholder = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBlur = () => {
    setIsFocused(false);
    const validationResult = validate ? validate(value) : true;
    if (validationResult === true) {
      setError(null);
    } else {
      setError(validationResult);
    }
  };

  const borderColor = isFocused
    ? '#007AFF' // blau bei Fokus
    : error
      ? '#FF3B30' // rot bei Fehler
      : value && !error
        ? '#34C759' // grün bei korrekt
        : '#ccc'; // default grau

  const labelColor = isFocused ? '#007AFF' : '#999';

  return (
    <>
      <View style={[styles.container, { borderColor }]}>
        {showLabel && label && (
          <Text style={[styles.label, { color: labelColor }]}>
            {label}
          </Text>
        )}
        <TextInput
          placeholder={showLabel && !label ? placeholder : ''}
          placeholderTextColor="#999"
          value={value}
          onChangeText={text => {
            onChangeText(text);
            if (error) {
              setError(null);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          style={styles.input}
        />
      </View>
      {/* Fehlertext außerhalb des Containers */}
      <View style={styles.errorContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 8,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 12,
    top: 6,
    fontSize: 12,
  },
  input: {
    fontSize: 16,
    color: '#000',
    padding: 0,
    margin: 0,
  },
  errorContainer: {
    minHeight: 18, // Höhe reservieren, damit Layout nicht springt
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
  },
});

export default UserInput;
