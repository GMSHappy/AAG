// ✅ MyFeedScreen.js - Connected logic for refreshing and search
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import FeedHeader from '../components/Feed/FeedHeader';
import FeedList from '../components/Feed/FeedList';
import UploadMedia from '../components/Feed/UploadMedia';
import { fetchPosts } from '../utils/mediaUtils';

const MyFeedScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  const loadPosts = useCallback(async () => {
    const fetchedPosts = await fetchPosts();
    setPosts(fetchedPosts);
    setFilteredPosts((prev) => {
      if (searchTerm) {
        return fetchedPosts.filter(post => post.caption.toLowerCase().includes(searchTerm.toLowerCase()));
      } else {
        return fetchedPosts;
      }
    });
  }, [searchTerm]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSearch = (text) => {
    setSearchTerm(text);
    if (text) {
      setFilteredPosts(posts.filter(post => post.caption.toLowerCase().includes(text.toLowerCase())));
    } else {
      setFilteredPosts(posts);
    }
  };

  return (
    <View style={styles.container}>
      <FeedHeader onSearch={handleSearch} />
      <FeedList posts={filteredPosts} onRefresh={loadPosts} />
      <UploadMedia onUploadSuccess={loadPosts} />
    </View>
  );
};

export default MyFeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
});
// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet } from 'react-native'; 