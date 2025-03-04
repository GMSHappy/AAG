import React, { useState, useEffect } from "react";
import { View, FlatList, Alert, ScrollView } from "react-native";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import { jsPDF } from "jspdf";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, Text, TextInput, Card, Divider } from "react-native-paper";

const TimetableScreen = () => {
    const [timetable, setTimetable] = useState([]);
    const [form, setForm] = useState({ date: "", time: "", day: "", lecture: "", course: "", type: "" });
    const [editingId, setEditingId] = useState(null);
    const user = auth.currentUser;

    useEffect(() => {
        if (user) fetchTimetable();
    }, [user]);

    const fetchTimetable = async () => {
        if (!user) return;
        try {
            const q = query(collection(db, "timetable"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            setTimetable(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            Alert.alert("Error", "Failed to fetch timetable. Check your permissions.");
            console.error("Error fetching timetable:", error);
        }
    };

    const handleInputChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const addOrUpdateTimetable = async () => {
        if (!user) {
            Alert.alert("Error", "User not authenticated.");
            return;
        }

        const entryData = { ...form, userId: user.uid };

        try {
            if (editingId) {
                await updateDoc(doc(db, "timetable", editingId), entryData);
                setEditingId(null);
            } else {
                await addDoc(collection(db, "timetable"), entryData);
            }
            resetForm();
            fetchTimetable();
        } catch (error) {
            Alert.alert("Error", "Failed to save timetable.");
            console.error("Error saving timetable:", error);
        }
    };

    const resetForm = () => {
        setForm({ date: "", time: "", day: "", lecture: "", course: "", type: "" });
    };

    const exportToPDF = () => {
        if (timetable.length === 0) {
            Alert.alert("Error", "No timetable entries to export.");
            return;
        }
        
        const pdf = new jsPDF();
        pdf.text("Timetable", 10, 10);
        timetable.forEach((entry, index) => {
            pdf.text(`${entry.date} ${entry.time} - ${entry.lecture}`, 10, 20 + index * 10);
        });
        pdf.save("timetable.pdf");
    };

    return (
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#f5f5f5" }}>
            <Text variant="headlineMedium" style={{ textAlign: "center", marginBottom: 20 }}>My Timetable</Text>
            <TextInput label="Date" mode="outlined" onChangeText={(text) => handleInputChange("date", text)} value={form.date} />
            <TextInput label="Time" mode="outlined" onChangeText={(text) => handleInputChange("time", text)} value={form.time} />
            <TextInput label="Day" mode="outlined" onChangeText={(text) => handleInputChange("day", text)} value={form.day} />
            <TextInput label="Lecture" mode="outlined" onChangeText={(text) => handleInputChange("lecture", text)} value={form.lecture} />
            <TextInput label="Course" mode="outlined" onChangeText={(text) => handleInputChange("course", text)} value={form.course} />
            <TextInput label="Type" mode="outlined" onChangeText={(text) => handleInputChange("type", text)} value={form.type} />
            <Button mode="contained" onPress={addOrUpdateTimetable} style={{ marginVertical: 10 }}>{editingId ? "Update" : "Add"} Timetable</Button>
            <Divider style={{ marginVertical: 10 }} />
            <FlatList
                data={timetable}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Card style={{ marginBottom: 10 }}>
                        <Card.Title title={`${item.date} ${item.time}`} subtitle={`${item.day} - ${item.lecture}`} left={(props) => <MaterialIcons {...props} name="event" />} />
                        <Card.Content>
                            <Text>{`Course: ${item.course}`}</Text>
                            <Text>{`Type: ${item.type}`}</Text>
                        </Card.Content>
                        <Card.Actions>
                            <Button onPress={() => deleteDoc(doc(db, "timetable", item.id)).then(fetchTimetable)}>Delete</Button>
                        </Card.Actions>
                    </Card>
                )}
            />
            <Button mode="outlined" onPress={exportToPDF} style={{ marginTop: 10 }}>Export as PDF</Button>
        </ScrollView>
    );
};

export default TimetableScreen;
