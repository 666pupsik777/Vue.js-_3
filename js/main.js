Vue.component('card-component', {
    props: ['card', 'columnIndex'],
    data() {
        return {
            isEditing: false,
            error: '',
            showReturnInput: false
        };
    },

    mounted() {
        localStorage.clear();
    },

    methods: {
        editCard() {
            this.isEditing = true;
            this.error = '';
        },
        saveCard() {
            if (!this.card.title.trim()) {
                this.error = 'Заголовок не может быть пустым';
                return;
            }
            this.isEditing = false;
            this.card.lastEdited = new Date().toLocaleString();
            this.$emit('update-card', this.card);
        },
        returnToWork() {
            this.showReturnInput = true;
        },
        saveReturnReason() {
            if (this.card.returnReason.trim()) {
                this.showReturnInput = false;
                this.$emit('move-card', { cardId: this.card.id, fromColumnIndex: this.columnIndex, toColumnIndex: 1 });
            }
        }
    },
    template: `
        <div class="card" :class="{ 'card-overdue': card.isOverdue, 'card-completed': card.isCompleted }">
            <div v-if="!isEditing">
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
                <p><b>Создано:</b> {{ card.createdAt }}</p>
                <p><b>Последнее редактирование:</b> {{ card.lastEdited ? card.lastEdited : 'Нет' }}</p>
                <p><b>Дедлайн:</b> {{ card.deadline ? new Date(card.deadline).toLocaleString() : 'Нет' }}</p>
                <p v-if="card.returnReason"><b>Причина возврата:</b> {{ card.returnReason }}</p>
                <div v-if="showReturnInput">
                    <input v-model="card.returnReason" placeholder="Укажите причину возврата">
                    <button @click="saveReturnReason">Сохранить причину</button>
                </div>
                <button @click="editCard">Редактировать</button>
                <button v-if="columnIndex === 0" @click="$emit('delete-card', card.id, columnIndex)">Удалить</button>
                <button v-if="columnIndex === 0" @click="$emit('move-card', { cardId: card.id, fromColumnIndex: columnIndex, toColumnIndex: 1 })">В работу</button>
                <button v-if="columnIndex === 1" @click="$emit('move-card', { cardId: card.id, fromColumnIndex: columnIndex, toColumnIndex: 2 })">В тестирование</button>
                <button v-if="columnIndex === 2" @click="returnToWork">Вернуть в работу</button>
                <button v-if="columnIndex === 2" @click="$emit('move-card', { cardId: card.id, fromColumnIndex: columnIndex, toColumnIndex: 3 })">Завершить</button>
            </div>
            <div v-else>
                <input v-model="card.title" placeholder="Заголовок" required>
                <textarea v-model="card.description" placeholder="Описание"></textarea>
                <input type="datetime-local" v-model="card.deadline">
                <button @click="saveCard">Сохранить</button>
                <p v-if="error" class="error">{{ error }}</p>
            </div>
        </div>
    `
});

Vue.component('column-component', {
    props: ['column', 'columnIndex'],
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <button v-if="columnIndex === 0" @click="$emit('add-card', columnIndex)">Добавить карточку</button>
            <div class="cards">
                <card-component
                    v-for="card in column.cards"
                    :key="card.id"
                    :card="card"
                    :column-index="columnIndex"
                    @delete-card="$emit('delete-card', $event, columnIndex)"
                    @move-card="$emit('move-card', $event)"
                    @update-card="$emit('update-card', $event)"
                ></card-component>
            </div>
        </div>
    `
});

const app = new Vue({
    el: '#app',
    data() {
        return {
            columns: JSON.parse(localStorage.getItem("columns")) || [
                { title: 'Запланированные задачи', cards: [] },
                { title: 'Задачи в работе', cards: [] },
                { title: 'Тестирование', cards: [] },
                { title: 'Выполненные задачи', cards: [] }
            ]
        };
    },
    methods: {
        addCard(columnIndex) {
            const newCard = {
                id: Date.now(),
                title: '',
                description: '',
                createdAt: new Date().toLocaleString(),
                deadline: null,
                lastEdited: null,
                returnReason: '',
                isOverdue: false,
                isCompleted: false
            };
            this.columns[columnIndex].cards.push(newCard);
            this.saveToLocalStorage();
        },
        deleteCard(cardId, columnIndex) {
            this.columns[columnIndex].cards = this.columns[columnIndex].cards.filter(c => c.id !== cardId);
            this.saveToLocalStorage();
        },
        moveCard({ cardId, fromColumnIndex, toColumnIndex }) {
            const card = this.columns[fromColumnIndex].cards.find(c => c.id === cardId);
            if (card) {
                if (toColumnIndex === 3) {
                    const now = new Date();
                    const deadline = card.deadline ? new Date(card.deadline) : null;
                    if (deadline && deadline < now) {
                        card.isOverdue = true;
                    } else {
                        card.isCompleted = true;
                    }
                }
                this.columns[fromColumnIndex].cards = this.columns[fromColumnIndex].cards.filter(c => c.id !== cardId);
                this.columns[toColumnIndex].cards.push(card);
                this.saveToLocalStorage();
            }
        },
        updateCard(card) {
            for (let column of this.columns) {
                const foundCard = column.cards.find(c => c.id === card.id);
                if (foundCard) {
                    Object.assign(foundCard, card);
                    break;
                }
            }
            this.saveToLocalStorage();
        },
        saveToLocalStorage() {
            localStorage.setItem("columns", JSON.stringify(this.columns));
        }
    }
});