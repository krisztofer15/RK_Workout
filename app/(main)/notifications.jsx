import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Alert } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { deleteNotification, deleteAllNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import Icon from '../../assets/Icons';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error.message);
        return;
      }

      setNotifications(data);
    };

    fetchNotifications();
  }, []);

  // Egy értesítés törlése
  const handleDelete = async (id) => {
    const res = await deleteNotification(id);
    if (res.success) {
      setNotifications(notifications.filter(notif => notif.id !== id));
    } else {
      Alert.alert('Error', res.msg);
    }
  };

  // Összes értesítés törlése
  const handleDeleteAll = async () => {
    if (!userId) return;
    const res = await deleteAllNotifications(userId);
    if (res.success) {
      setNotifications([]);
    } else {
      Alert.alert('Error', res.msg);
    }
  };

  // Egy értesítés olvasottként jelölése
  const handleMarkAsRead = async (id) => {
    const res = await markAsRead(id);
    if (res.success) {
      setNotifications(notifications.map(notif => notif.id === id ? { ...notif, is_read: true } : notif));
    } else {
      Alert.alert('Error', res.msg);
    }
  };

  // Összes értesítés olvasottként jelölése
  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    const res = await markAllAsRead(userId);
    if (res.success) {
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } else {
      Alert.alert('Error', res.msg);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Notifications" mb={40} />

        {/* Műveletek gombok */}
        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={handleDeleteAll}>
            <Text style={styles.buttonText}>Delete All</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleMarkAllAsRead}>
            <Text style={styles.buttonText}>Mark All as Read</Text>
          </Pressable>
        </View>

        {/* Értesítések listája */}
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.notificationCard, item.is_read && styles.read]}>
              <View style={styles.notificationHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <Pressable onPress={() => handleDelete(item.id)}>
                  <Icon name="delete" size={22} color="#FF6600" />
                </Pressable>
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <View style={styles.notificationActions}>
                {!item.is_read && (
                  <Pressable style={styles.markAsReadButton} onPress={() => handleMarkAsRead(item.id)}>
                    <Text style={styles.markAsReadText}>Mark as Read</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF6600',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  notificationCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  read: {
    backgroundColor: '#e0e0e0',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    fontSize: 14,
    color: '#555',
  },
  notificationActions: {
    marginTop: 10,
  },
  markAsReadButton: {
    backgroundColor: '#FF6600',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  markAsReadText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
