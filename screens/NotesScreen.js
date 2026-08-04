import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Platform, 
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function NotesScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Load data saat screen dibuka
  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

      

    if (error) {
      Alert.alert('Error', 'Gagal memuat catatan: ' + error.message);
    } else {
      setNotes(data);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setModalVisible(true);
  }

  function openEditModal(note) {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Error', 'Judul tidak boleh kosong');
      return;
    }

    if (editingNote) {
      // Update catatan yang sudah ada
      const { error } = await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', editingNote.id);

      if (error) {
        Alert.alert('Error', 'Gagal update catatan: ' + error.message);
        return;
      }
    } else {
      // Insert catatan baru
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('notes').insert({
        title,
        content,
        user_id: userData.user.id,
      });

      if (error) {
        Alert.alert('Error', 'Gagal menambah catatan: ' + error.message);
        return;
      }
    }

    setModalVisible(false);
    fetchNotes();
  }



async function handleDelete(id) {
  const confirmDelete = async () => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      Alert.alert('Error', 'Gagal menghapus catatan: ' + error.message);
    } else {
      fetchNotes();
    }
  };

  if (Platform.OS === 'web') {
    // Web: pakai confirm() bawaan browser
    if (window.confirm('Yakin ingin menghapus catatan ini?')) {
      confirmDelete();
    }
  } else {
    // Mobile: pakai Alert.alert seperti biasa
    Alert.alert('Hapus Catatan', 'Yakin ingin menghapus catatan ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: confirmDelete },
    ]);
  }
}

  async function handleLogout() {
    await supabase.auth.signOut();
    navigation.replace('Login');
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada catatan. Tambah yuk!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noteItem}
            onPress={() => openEditModal(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteContent} numberOfLines={2}>
                {item.content}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Hapus</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingNote ? 'Edit Catatan' : 'Tambah Catatan'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Judul"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Isi catatan"
              value={content}
              onChangeText={setContent}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoutButton: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#888' },
  noteItem: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  noteTitle: { fontSize: 16, fontWeight: '600' },
  noteContent: { fontSize: 13, color: '#555', marginTop: 4 },
  deleteButton: { paddingHorizontal: 10, paddingVertical: 6 },
  deleteText: { color: '#ef4444', fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#ec4899',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 28 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: { backgroundColor: '#94a3b8' },
  saveButton: { backgroundColor: '#ec4899' },
  modalButtonText: { color: '#fff', fontWeight: '600' },
});