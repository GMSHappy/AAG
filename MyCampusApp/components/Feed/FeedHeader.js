// ✅ FeedHeader.js - Added debounce for search input
import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Image, StyleSheet, TouchableOpacity, FlatList, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const FeedHeader = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (onSearch) onSearch(text);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.length > 2) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(() => {
        performSearch(text);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const performSearch = async (text) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '>=', text), where('username', '<=', text + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleAddFriend = (userId) => {
    Alert.alert('Friend request sent');
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
          <TextInput
            placeholder="Search friends..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setTimeout(() => setIsSearching(false), 200)}
          />
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="add" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {isSearching && searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.resultItem}>
                <Text style={styles.resultText}>{item.username}</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => handleAddFriend(item.id)}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
    zIndex: 10,
  },
  header: {
    padding: 12,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  uploadButton: {
    marginRight: 15,
  },
  searchResults: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginHorizontal: 12,
    maxHeight: 200,
    elevation: 3,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  resultText: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default FeedHeader;