Vue.component('card-component', {
    props: ['card', 'columnIndex'],
    data() { return { isEditing: false, error: '' }; },
    methods: {
        editCard() { this.isEditing = true; },
        saveCard() {
            if (!this.card.title.trim()) { this.error = 'Заголовок пуст'; return; }
            this.isEditing = false;
            this.card.lastEdited = new Date().toLocaleString();
            this.$emit('update-card', this.card);
        }
    },
    template: `
        <div class="card">
            <div v-if="!isEditing">
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
                <button @click="editCard">Редактировать</button>
                <button v-if="columnIndex === 0" @click="$emit('delete-card', card.id, columnIndex)">Удалить</button>
                <button v-if="columnIndex === 0" @click="$emit('move-card', { cardId: card.id, fromColumnIndex: columnIndex, toColumnIndex: 1 })">В работу</button>
            </div>
            <div v-else>
                <input v-model="card.title">
                <textarea v-model="card.description"></textarea>
                <button @click="saveCard">Сохранить</button>
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
            const newCard = { id: Date.now(), title: '', description: '', createdAt: new Date().toLocaleString(), deadline: null, lastEdited: null, returnReason: '', isOverdue: false, isCompleted: false };
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
                this.columns[fromColumnIndex].cards = this.columns[fromColumnIndex].cards.filter(c => c.id !== cardId);
                this.columns[toColumnIndex].cards.push(card);
                this.saveToLocalStorage();
            }
        },
        updateCard(card) { this.saveToLocalStorage(); },
        saveToLocalStorage() { localStorage.setItem("columns", JSON.stringify(this.columns)); }
    }
});