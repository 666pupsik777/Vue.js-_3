Vue.component('card-component', {
    props: ['card', 'columnIndex'],
    data() {
        return {
            isEditing: false,
            showReturnInput: false,
            returnReasonText: ''
        };
    },
    methods: {
        saveEdit() {
            if (this.card.title.trim()) {
                this.card.lastEdited = new Date().toLocaleString();
                this.isEditing = false;
                this.$emit('update-card');
            }
        },
        confirmReturn() {
            if (this.returnReasonText.trim()) {
                this.card.returnReason = this.returnReasonText;
                this.showReturnInput = false;
                this.$emit('move-card', { cardId: this.card.id, fromColumnIndex: this.columnIndex, toColumnIndex: 1 });
            }
        }
    },
    template: `
        <div class="card" :class="{'card-overdue': card.isOverdue, 'card-completed': card.isCompleted}">
            <div v-if="!isEditing">
                <h3>{{ card.title }}</h3>
                
                <p v-if="card.description && card.description.trim()">{{ card.description }}</p>
                <p v-else class="empty-hint">Описание отсутствует...</p>

                <div class="card-info-block">
                    <p v-if="card.deadline"><b>Дэдлайн:</b> {{ new Date(card.deadline).toLocaleString() }}</p>
                    <p v-else class="empty-hint">Дэдлайн не указан</p>
                    
                    <p><b>Создано:</b> {{ card.createdAt }}</p>
                    <p v-if="card.lastEdited"><b>Изменено:</b> {{ card.lastEdited }}</p>
                </div>
                
                <p v-if="card.returnReason" class="return-tag">
                    <b>Причина возврата:</b> {{ card.returnReason }}
                </p>

                <div v-if="columnIndex === 3 && card.completionStatus" 
                     :class="['deadline-status', card.isOverdue ? 'status-fail' : 'status-success']">
                    {{ card.completionStatus }}
                </div>

                <div v-if="showReturnInput" class="return-form">
                    <input v-model="returnReasonText" placeholder="Причина возврата">
                    <button class="btn-mini-ok" @click="confirmReturn">OK</button>
                </div>

                <div class="card-buttons">
                    <button v-if="columnIndex !== 3" class="btn-action btn-edit" @click="isEditing = true">Редактировать</button>
                    
                    <button v-if="columnIndex === 0 || columnIndex === 3" class="btn-action btn-delete" @click="$emit('delete-card', card.id, columnIndex)">Удалить</button>
                    
                    <button v-if="columnIndex === 0" class="btn-action btn-move" @click="$emit('move-card', { cardId: card.id, fromColumnIndex: 0, toColumnIndex: 1 })">В работу</button>
                    <button v-if="columnIndex === 1" class="btn-action btn-move" @click="$emit('move-card', { cardId: card.id, fromColumnIndex: 1, toColumnIndex: 2 })">В тест</button>
                    <button v-if="columnIndex === 2" class="btn-action btn-done" @click="$emit('move-card', { cardId: card.id, fromColumnIndex: 2, toColumnIndex: 3 })">Завершить</button>

                    <button v-if="columnIndex === 2" class="btn-action btn-return" @click="showReturnInput = true">Вернуть</button>
                    
                    <button v-if="columnIndex === 3" class="btn-action btn-return" @click="$emit('move-card', { cardId: card.id, fromColumnIndex: 3, toColumnIndex: 2 })">В тест</button>
                </div>
            </div>
            
            <div v-else class="edit-mode-container">
                <input v-model="card.title" placeholder="Заголовок">
                <textarea v-model="card.description" placeholder="Описание"></textarea>
                <input type="datetime-local" v-model="card.deadline">
                <div class="edit-btns">
                    <button class="btn-action btn-done" @click="saveEdit">Сохранить</button>
                    <button class="btn-action btn-edit" @click="isEditing = false">Отмена</button>
                </div>
            </div>
        </div>
    `
});

Vue.component('notepad', {
    data() {
        return {
            newTitle: '',
            newDesc: '',
            newDeadline: '',
            columns: JSON.parse(localStorage.getItem('kanban_final_fixed')) || [
                { title: 'Запланированные задачи', cards: [] },
                { title: 'Задачи в работе', cards: [] },
                { title: 'Тестирование', cards: [] },
                { title: 'Выполненные задачи', cards: [] }
            ]
        };
    },
    methods: {
        addCard() {
            if (!this.newTitle.trim()) return;
            const card = {
                id: Date.now(),
                title: this.newTitle,
                description: this.newDesc,
                deadline: this.newDeadline,
                createdAt: new Date().toLocaleString(),
                lastEdited: null,
                returnReason: '',
                isOverdue: false,
                isCompleted: false,
                completionStatus: ''
            };
            this.columns[0].cards.push(card);
            this.newTitle = ''; this.newDesc = ''; this.newDeadline = '';
            this.save();
        },
        moveCard(cardId, fromCol, toCol) {
            const idx = this.columns[fromCol].cards.findIndex(c => c.id === cardId);
            const card = this.columns[fromCol].cards.splice(idx, 1)[0];

            // Логика проверки дедлайна при переходе в 4-й столбец (индекс 3)
            if (toCol === 3) {
                if (card.deadline) {
                    const now = new Date();
                    const dl = new Date(card.deadline);
                    if (dl < now) {
                        card.isOverdue = true;
                        card.isCompleted = false;
                        card.completionStatus = "Дэдлайн просрочен";
                    } else {
                        card.isOverdue = false;
                        card.isCompleted = true;
                        card.completionStatus = "Дэдлайн выполнен в срок";
                    }
                } else {
                    card.isCompleted = true;
                    card.isOverdue = false;
                    card.completionStatus = "Срок дэдлайна не указан";
                }
            } else {
                // Сброс статусов при возврате из выполненных
                card.isOverdue = false;
                card.isCompleted = false;
                card.completionStatus = '';
            }

            this.columns[toCol].cards.push(card);
            this.save();
        },
        save() {
            localStorage.setItem('kanban_final_fixed', JSON.stringify(this.columns));
        }
    },
    template: `
    <div class="notepad">
        <div class="card-creator">
            <h3>Новая задача</h3>
            <input v-model="newTitle" placeholder="Заголовок задачи">
            <textarea v-model="newDesc" placeholder="Описание задачи"></textarea>
            <label style="font-size: 0.8rem; color: #4a5568;">Дэдлайн:</label>
            <input type="datetime-local" v-model="newDeadline">
            <button class="btn-submit" :disabled="!newTitle.trim()" @click="addCard">Создать задачу</button>
        </div>

        <div v-for="(col, idx) in columns" :key="idx" class="column">
            <h2>{{ col.title }}</h2>
            <div class="cards-container">
                <card-component 
                    v-for="card in col.cards" 
                    :key="card.id"
                    :card="card"
                    :column-index="idx"
                    @delete-card="(id) => { col.cards = col.cards.filter(c => c.id !== id); save(); }"
                    @update-card="save"
                    @move-card="data => moveCard(data.cardId, data.fromColumnIndex, data.toColumnIndex)"
                ></card-component>
            </div>
        </div>
    </div>
`
});

new Vue({ el: '#app' });