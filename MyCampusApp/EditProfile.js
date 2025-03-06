import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Button, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const EditProfile = ({ user, onSave, onCancel }) => {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [birthday, setBirthday] = useState(user.birthday || "");

  const handleSave = () => {
    onSave({ firstName, lastName, bio, birthday });
  };

  return (
    <Modal animationType="slide" transparent={true} visible={true}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            {/* First Name Input */}
            <View style={styles.inputContainer}>
              <Icon name="account" size={20} color="#555" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            {/* Last Name Input */}
            <View style={styles.inputContainer}>
              <Icon name="account" size={20} color="#555" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Bio Input */}
            <View style={styles.inputContainer}>
              <Icon name="pencil" size={20} color="#555" style={styles.icon} />
              <TextInput
                style={styles.inputBio}
                placeholder="Write a short bio..."
                multiline
                value={bio}
                onChangeText={setBio}
              />
            </View>

            {/* Birthday Input */}
            <View style={styles.inputContainer}>
              <Icon name="cake" size={20} color="#555" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Birthday (YYYY-MM-DD)"
                value={birthday}
                onChangeText={setBirthday}
              />
            </View>

            {/* Save and Cancel Buttons */}
            <View style={styles.buttonContainer}>
              <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                Save
              </Button>
              <Button onPress={onCancel} style={styles.cancelButton}>
                Cancel
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ================= STYLES =================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    elevation: 10,
  },
  modalContent: {
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  inputBio: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  saveButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ccc",
    borderRadius: 8,
  },
});

export default EditProfile;
