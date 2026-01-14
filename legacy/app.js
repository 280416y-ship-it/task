const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

// 初期表示: 保存されているタスクを読み込む
async function loadTasks() {
    taskList.innerHTML = '<p style="text-align:center; color:#94a3b8;">読み込み中...</p>';

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching tasks:', error);
        return;
    }

    taskList.innerHTML = '';
    data.forEach(task => {
        createTaskElement(task.id, task.title);
    });
}

// タスクを追加する
async function addTask() {
    const title = taskInput.value.trim();
    if (!title) return;

    // Supabaseに追加
    const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: title }])
        .select();

    if (error) {
        alert('タスクの追加に失敗しました。');
        console.error(error);
        return;
    }

    // 入力欄をクリア
    taskInput.value = '';

    // リストに表示
    createTaskElement(data[0].id, data[0].title);
}

// タスクを削除する（チェックマークが押された時）
async function deleteTask(id, element) {
    // UIを即座に消す（アニメーション）
    element.style.opacity = '0';
    element.style.transform = 'scale(0.9)';

    setTimeout(async () => {
        // Supabaseから削除
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) {
            alert('削除に失敗しました。');
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
            console.error(error);
        } else {
            element.remove();
        }
    }, 300);
}

// タスクのHTML要素を作成する
function createTaskElement(id, title) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
        <div class="check-btn"></div>
        <span class="task-text">${title}</span>
    `;

    // チェックボタンのイベント
    const checkBtn = li.querySelector('.check-btn');
    checkBtn.onclick = () => deleteTask(id, li);

    taskList.appendChild(li);
}

// イベントリスナー
addBtn.onclick = addTask;
taskInput.onkeypress = (e) => {
    if (e.key === 'Enter') addTask();
};

// 起動時にタスクをロード
loadTasks();
