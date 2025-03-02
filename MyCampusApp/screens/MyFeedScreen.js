import React from "react";
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

const stories = [
  { id: "1", user: "Your Story", image: "https://source.unsplash.com/random/100x100" },
  { id: "2", user: "karenne", image: "https://source.unsplash.com/random/101x101" },
  { id: "3", user: "zackjohn", image: "https://source.unsplash.com/random/102x102" },
  { id: "4", user: "kieron_d", image: "https://source.unsplash.com/random/103x103" },
];

const posts = [
  {
    id: "1",
    user: "joshua_l",
    location: "Tokyo, Japan",
    profile: "https://source.unsplash.com/random/50x50",
    image: "https://source.unsplash.com/random/300x200",
    caption: "The game in Japan was amazing and I want to share some photos",
    likes: 44686,
    comments: 123,
  },
];

const MyFeedScreen = () => {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>MYCAMPUS</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="paper-plane-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* STORIES SECTION */}
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storyContainer}
        renderItem={({ item }) => (
          <View style={styles.story}>
            <Image source={{ uri: item.image }} style={styles.storyImage} />
            <Text style={styles.storyText}>{item.user}</Text>
          </View>
        )}
      />

      {/* POSTS LIST */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            {/* POST HEADER */}
            <View style={styles.postHeader}>
              <Image source={{ uri: item.profile }} style={styles.profileImage} />
              <View>
                <Text style={styles.username}>{item.user}</Text>
                <Text style={styles.location}>{item.location}</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color="black" />
              </TouchableOpacity>
            </View>

            {/* POST IMAGE */}
            <Image source={{ uri: item.image }} style={styles.postImage} />

            {/* POST ACTIONS */}
            <View style={styles.postActions}>
              <TouchableOpacity>
                <FontAwesome name="heart-o" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity>
                <FontAwesome name="comment-o" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="paper-plane-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* LIKES & CAPTION */}
            <Text style={styles.likes}>Liked by {item.likes} others</Text>
            <Text style={styles.caption}>
              <Text style={styles.username}>{item.user} </Text>
              {item.caption}
            </Text>
          </View>
        )}
      />

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        {["home", "search", "add-circle", "heart", "person"].map((icon, index) => (
          <TouchableOpacity key={index}>
            <Ionicons name={`${icon}-outline`} size={28} color="black" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  /* HEADER */
  header: { flexDirection: "row", justifyContent: "space-between", padding: 15, alignItems: "center" },
  logo: { fontSize: 24, fontWeight: "bold" },
  headerIcons: { flexDirection: "row", gap: 15 },

  /* STORIES */
  storyContainer: { padding: 10 },
  story: { alignItems: "center", marginRight: 15 },
  storyImage: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: "#e1306c" },
  storyText: { fontSize: 12, marginTop: 5 },

  /* POSTS */
  postContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  postHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontWeight: "bold", fontSize: 14 },
  location: { fontSize: 12, color: "gray" },
  postImage: { width: "100%", height: 300, borderRadius: 10, marginVertical: 10 },

  /* POST ACTIONS */
  postActions: { flexDirection: "row", gap: 15, paddingVertical: 5 },
  likes: { fontWeight: "bold", marginTop: 5 },
  caption: { fontSize: 14, marginTop: 5 },

  /* BOTTOM NAV */
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
});

export default MyFeedScreen;

