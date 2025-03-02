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
        const querySnapshot = await getDocs(collection(db, "timetable"));
        setTimetable(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleInputChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const addOrUpdateTimetable = async (e) => {
        e.preventDefault();
        if (editingId) {
            await updateDoc(doc(db, "timetable", editingId), form);
            setEditingId(null);
        } else {
            await addDoc(collection(db, "timetable"), form);
        }
        setForm({ date: "", time: "", day: "", lecture: "", course: "", type: "" });
        fetchTimetable();
    };

    const editTimetable = (entry) => {
        setForm(entry);
        setEditingId(entry.id);
    };

    const deleteTimetable = async (id) => {
        await deleteDoc(doc(db, "timetable", id));
        fetchTimetable();
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

    const filteredTimetable = timetable.filter(entry => entry.lecture.includes(search) || entry.date.includes(search));

    return (
        <div>
            <h1>Timetable</h1>
            <input type="text" placeholder="Search by lecture or date..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button onClick={exportToPDF}>Export as PDF</button>
            <form onSubmit={addOrUpdateTimetable}>
                <input type="date" name="date" value={form.date} onChange={handleInputChange} required />
                <input type="time" name="time" value={form.time} onChange={handleInputChange} required />
                <input type="text" name="day" placeholder="Day" value={form.day} onChange={handleInputChange} required />
                <input type="text" name="lecture" placeholder="Lecture Name" value={form.lecture} onChange={handleInputChange} required />
                <input type="text" name="course" placeholder="Course" value={form.course} onChange={handleInputChange} required />
                <select name="type" value={form.type} onChange={handleInputChange}>
                    <option value="">Select Type</option>
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Seminar">Seminar</option>
                </select>
                <button type="submit">{editingId ? "Update" : "Add"}</button>
            </form>
            <ul>
                {timetable.filter(entry => entry.lecture.includes(search) || entry.date.includes(search)).map(entry => (
                    <li key={entry.id} style={{ backgroundColor: entry.type === "Lab" ? "lightblue" : entry.type === "Seminar" ? "lightgreen" : "white" }}>
                        {entry.date} {entry.time} - {entry.day} - {entry.lecture} ({entry.course}) [{entry.type}]
                        <button onClick={() => editTimetable(entry)}>Edit</button>
                        <button onClick={() => deleteTimetable(entry.id)}>Delete</button>
                        <button onClick={() => setReminder(entry)}>Set Reminder</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TimetableScreen;
