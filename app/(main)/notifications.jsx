import { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Pressable, 
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MotiView, AnimatePresence } from 'moti';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { deleteNotification, deleteAllNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { Trash2, Check, BellOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animációs értékek
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Belépési animáció
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      })
    ]).start();
    
    fetchNotifications();

    // Valós idejű frissítés (Realtime Supabase)
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {event: "INSERT", schema: "public", table: "notifications"},
        (payload) => {
          console.log(" Új értesítés érkezett:", payload.new);
          setNotifications((prev) => [payload.new, ...prev]);

          // Haptikus visszajelzés új értesítéskor
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // Megjelenítjük az animált Toast értesítést
          Toast.show({
            type: "success",
            text1: payload.new.title,
            text2: payload.new.message,
            visibilityTime: 4000,
            autoHide: true,
          });
        }
      )
      .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
  }, []);

  const fetchNotifications = async () => {
    setRefreshing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setRefreshing(false);
      return;
    }
    setUserId(user.id);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error.message);
      setRefreshing(false);
      return;
    }

    setNotifications(data);
    setRefreshing(false);
  };

  // Egy értesítés törlése
  const handleDelete = async (id) => {
    // Haptikus visszajelzés
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
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
    
    // Megerősítő kérdés
    Alert.alert(
      "Megerősítés",
      "Biztosan törölni szeretnéd az összes értesítést?",
      [
        {
          text: "Mégse",
          style: "cancel"
        },
        {
          text: "Törlés",
          onPress: async () => {
            // Haptikus visszajelzés
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            
            const res = await deleteAllNotifications(userId);
            if (res.success) {
              setNotifications([]);
              
              Toast.show({
                type: "success",
                text1: "Sikeres törlés",
                text2: "Az összes értesítés törölve lett",
              });
            } else {
              Alert.alert('Error', res.msg);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Egy értesítés olvasottként jelölése
  const handleMarkAsRead = async (id) => {
    // Haptikus visszajelzés
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
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
    
    // Haptikus visszajelzés
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const res = await markAllAsRead(userId);
    if (res.success) {
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
      
      Toast.show({
        type: "success",
        text1: "Sikeres művelet",
        text2: "Az összes értesítés olvasottként jelölve",
      });
    } else {
      Alert.alert('Error', res.msg);
    }
  };
  
  // Üres lista megjelenítése
  const renderEmptyList = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 500 }}
      style={styles.emptyContainer}
    >
      <BellOff size={60} color="#ccc" />
      <Text style={styles.emptyText}>Nincsenek értesítések</Text>
    </MotiView>
  );

  return (
    <ScreenWrapper bg="white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Animated.View 
        style={[
          styles.container,
          { 
            opacity: fadeAnim,
            transform: [{ translateY }] 
          }
        ]}
      >
        <Header title="Notifications" mb={20} />

        <Toast />

        {/* Műveletek gombok */}
        <View style={styles.actions}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, type: 'timing', duration: 500 }}
          >
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleDeleteAll}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Delete All</Text>
            </TouchableOpacity>
          </MotiView>
          
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, type: 'timing', duration: 500 }}
          >
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleMarkAllAsRead}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Mark All as Read</Text>
            </TouchableOpacity>
          </MotiView>
        </View>

        {/* Értesítések listája */}
        <AnimatePresence>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={notifications.length === 0 && styles.emptyList}
            ListEmptyComponent={renderEmptyList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ 
                  delay: 400 + (index * 100), 
                  type: 'timing', 
                  duration: 400
                }}
                exit={{
                  opacity: 0,
                  translateX: -width,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if (!item.is_read) {
                      handleMarkAsRead(item.id);
                    }
                  }}
                >
                  <View style={[
                    styles.notificationCard, 
                    item.is_read ? styles.read : styles.unread
                  ]}>
                    {!item.is_read && <View style={styles.unreadIndicator} />}
                    <View style={styles.notificationHeader}>
                      <Text style={styles.title}>{item.title}</Text>
                      <TouchableOpacity 
                        onPress={() => handleDelete(item.id)}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                      >
                        <Trash2 size={20} color={theme.colors.primary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.message}>{item.message}</Text>
                    <View style={styles.notificationFooter}>
                      <Text style={styles.timestamp}>
                        {new Date(item.created_at).toLocaleString('hu-HU', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      {!item.is_read && (
                        <TouchableOpacity 
                          style={styles.markAsReadButton} 
                          onPress={() => handleMarkAsRead(item.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.markAsReadText}>Olvasottnak jelöl</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </MotiView>
            )}
          />
        </AnimatePresence>
      </Animated.View>
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
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  notificationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  unread: {
    borderLeftColor: theme.colors.primary,
    backgroundColor: '#fff',
  },
  read: {
    borderLeftColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  markAsReadButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  markAsReadText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
});
