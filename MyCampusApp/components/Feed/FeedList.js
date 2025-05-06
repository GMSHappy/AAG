// ✅ FeedList.js - Optimized for stable refresh and render
import React, { memo } from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import FeedItem from './FeedItem';

const FeedList = ({ posts, onRefresh }) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const FeedList = ({ posts, onRefresh }) => {
    const handleRefresh = async () => {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    };
  
    const renderItem = ({ item }) => (
      <FeedItem post={item} onDelete={onRefresh} />
    );
  
  };
  
  const renderItem = ({ item }) => <FeedItem post={item} onDelete={onRefresh} />;


  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

export default memo(FeedList);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});