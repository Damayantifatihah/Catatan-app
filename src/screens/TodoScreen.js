import { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import { useTodos } from '../hooks/useTodos';
import { useThemeStore } from '../store/useThemeStore';
import { THEME, TODO_COLORS, COLORS } from '../constants/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../constants/typography';

function showMessage(title, message) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function TodoScreen() {
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const { todos, remaining, loading, error, add, edit, toggle, remove } = useTodos();

  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = isDark ? THEME.dark : THEME.light;

  const handleAddTodo = useCallback(async () => {
    const trimmed = text.trim();
    if (trimmed === '') return;
    await add(trimmed);
    setText('');
    Keyboard.dismiss();
  }, [text, add]);

  function handleStartEdit(id, title) {
    setEditingId(id);
    setEditingText(title);
  }

  async function handleSaveEdit() {
    if (editingId === null || editingText.trim() === '') return;
    await edit(editingId, editingText.trim());
    setEditingId(null);
    setEditingText('');
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditingText('');
  }

  function handleDelete(id) {
    if (Platform.OS === 'web') {
      if (window.confirm('Hapus tugas? Tugas ini akan dihapus dari daftar.')) remove(id);
    } else {
      Alert.alert('Hapus tugas?', 'Tugas ini akan dihapus dari daftar.', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => remove(id) },
      ]);
    }
  }

    return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: theme.greeting }]}>
              ✨ MY LITTLE TASKS
            </Text>
            <Text style={[styles.title, { color: theme.title }]}>
              Let's get things done ♡
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtitle }]}>
              {remaining === 0
                ? 'Everything is done! ✨'
                : `${remaining} little ${remaining === 1 ? 'thing' : 'things'} left to do`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: theme.themeBtn }]}
            onPress={toggleTheme}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>

        {/* INPUT TAMBAH TODO */}
        <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
          <Text style={styles.inputIcon}>✿</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What needs to be done?"
            placeholderTextColor={theme.inputPlaceholder}
            style={[styles.input, { color: theme.title }]}
            onSubmitEditing={handleAddTodo}
            returnKeyType="done"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.addButton, text.trim() === '' && styles.addButtonDisabled]}
            onPress={handleAddTodo}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION TITLE */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.title }]}>TODAY</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.countBadgeBg }]}>
            <Text style={[styles.countText, { color: theme.countText }]}>
              {todos.length} tasks
            </Text>
          </View>
        </View>

        {/* TODO LIST */}
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.list, todos.length === 0 && styles.emptyList]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌷</Text>
              <Text style={[styles.emptyTitle, { color: theme.title }]}>No tasks yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.emptySubtitle }]}>
                Add something you'd like to accomplish today ♡
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isEditing = editingId === item.id;

            return (
              <View style={[styles.todoCard, { backgroundColor: theme.card }]}>
                <TouchableOpacity
                  style={[styles.checkbox, item.completed && styles.checkboxDone]}
                  onPress={() => toggle(item)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  {item.completed && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>

                <View style={styles.todoContent}>
                  {isEditing ? (
                    <>
                      <TextInput
                        value={editingText}
                        onChangeText={setEditingText}
                        autoFocus
                        style={[
                          styles.editInput,
                          { color: theme.title, borderColor: theme.editBorder },
                        ]}
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity onPress={handleCancelEdit}>
                          <Text style={[styles.cancelText, { color: theme.cancelText }]}>
                            Batal
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                          <Text style={styles.saveText}>Simpan</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <Text
                      style={[
                        styles.todoTitle,
                        { color: theme.title },
                        item.completed && styles.completedText,
                      ]}
                    >
                      {item.title}
                    </Text>
                  )}
                </View>

                {!isEditing && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.actionBtnBg }]}
                      onPress={() => handleStartEdit(item.id, item.title)}
                    >
                      <Text style={styles.editIcon}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.actionBtnBg }]}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Text style={styles.deleteIcon}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.footer }]}>
            made with ♡ & a little sparkle
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 15 },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  headerText: { flex: 1 },
  greeting: { fontSize: FONT_SIZE.xs + 1, fontWeight: '800', letterSpacing: 1.5, marginBottom: 5 },
  title: { fontSize: 27, fontWeight: '800', lineHeight: 34 },
  subtitle: { fontSize: FONT_SIZE.sm, marginTop: 5 },
  themeButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: TODO_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  themeIcon: { fontSize: 19 },

  // INPUT
  inputCard: {
    minHeight: 62,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 27,
    shadowColor: TODO_COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  inputIcon: { fontSize: 22, color: TODO_COLORS.accent, marginHorizontal: 8 },
  input: { flex: 1, fontSize: FONT_SIZE.base, paddingVertical: 10 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: TODO_COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: TODO_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonDisabled: { opacity: 0.5 },
  addButtonText: { color: COLORS.white, fontSize: 25, fontWeight: '300', lineHeight: 28 },

  // SECTION
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: FONT_SIZE.sm, fontWeight: '800', letterSpacing: 1.4 },
  countBadge: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
  countText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },

  // LIST
  list: { paddingBottom: 10 },
  emptyList: { flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyEmoji: { fontSize: 50, marginBottom: 10 },
  emptyTitle: { fontSize: 19, fontWeight: '800', marginBottom: 5 },
  emptySubtitle: { fontSize: FONT_SIZE.sm, textAlign: 'center', maxWidth: 230, lineHeight: 20 },

  // TODO CARD
  todoCard: {
    minHeight: 72,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 11,
    shadowColor: TODO_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  checkbox: {
    width: 27,
    height: 27,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: TODO_COLORS.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxDone: { backgroundColor: TODO_COLORS.accent, borderColor: TODO_COLORS.accent },
  checkmark: { color: COLORS.white, fontSize: FONT_SIZE.lg, fontWeight: '900' },
  todoContent: { flex: 1 },
  todoTitle: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, lineHeight: 21 },
  completedText: { textDecorationLine: 'line-through', opacity: 0.45 },

  // ACTIONS
  actions: { flexDirection: 'row', gap: 7, marginLeft: 8 },
  actionButton: {
    width: 35,
    height: 35,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: { color: TODO_COLORS.accentStrong, fontSize: 19 },
  deleteIcon: { color: TODO_COLORS.accentStrong, fontSize: FONT_SIZE.xl },

  // EDIT
  editInput: {
    borderBottomWidth: 1.5,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
    paddingVertical: 3,
  },
  editActions: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  cancelText: { fontSize: 12, fontWeight: FONT_WEIGHT.semibold },
  saveButton: {
    backgroundColor: TODO_COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
  },
  saveText: { color: COLORS.white, fontSize: FONT_SIZE.xs, fontWeight: '800' },

  // FOOTER
  footer: { alignItems: 'center', paddingVertical: 8 },
  footerText: { fontSize: FONT_SIZE.xs, fontStyle: 'italic' },
});