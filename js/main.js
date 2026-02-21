Vue.component('card-component', {
    props: ['card', 'columnIndex'],
    data() {
        return { isEditing: false, error: '', showReturnInput: false };
    },
    methods: {
        editCard() { this.isEditing = true; },
        saveCard() {
            if (!this.card.title.trim()) { this.error = 'Заголовок не может быть пустым'; return; }
            this.isEditing = false;
            this.card.lastEdited = new Date().toLocaleString();
            this.$emit('update-card', this.card);
        },
        returnToWork() { this.showReturnInput = true; },
        saveReturnReason() {
            if (this.card.returnReason.trim()) {
                this.showReturnInput = false;
                this.$emit('move-card', { cardId: this.card.id, fromColumnIndex: this.columnIndex, toColumnIndex: 1 });
            }
        }
    },
    template: `
        <div class="card">
            <div v-if="!isEditing">
                <h3>{{ card.title }}</h3>
                <p v-if="card.returnReason"><b>Причина возврата:</b> {{ card.returnReason }}</p>
                <div v-if="showReturnInput">
                    <input v-model="card.returnReason" placeholder="Укажите причину возврата">
                    <button @click="saveReturnReason">Сохранить причину</button>
                </div>
                <button @click="editCard">Редактировать</button>
                <button v-if="columnIndex === 2" @click="returnToWork">Вернуть в работу</button>
                <button v-if="columnIndex === 2" @click="$emit('move-card', { cardId: card.id, fromColumnIndex: columnIndex, toColumnIndex: 3 })">Завершить</button>
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