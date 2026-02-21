Vue.component('card-component', {
    props: ['card', 'columnIndex'],
    data() {
        return { isEditing: false, error: '' };
    },
    methods: {
        editCard() { this.isEditing = true; this.error = ''; },
        saveCard() {
            if (!this.card.title.trim()) { this.error = 'Заголовок не может быть пустым'; return; }
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
                <p><b>Изменено:</b> {{ card.lastEdited || 'Нет' }}</p>
                <button @click="editCard">Редактировать</button>
            </div>
            <div v-else>
                <input v-model="card.title" placeholder="Заголовок">
                <textarea v-model="card.description" placeholder="Описание"></textarea>
                <input type="datetime-local" v-model="card.deadline">
                <button @click="saveCard">Сохранить</button>
                <p v-if="error" style="color:red">{{ error }}</p>
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
        updateCard(card) {
            this.saveToLocalStorage();
        },
        saveToLocalStorage() {
            localStorage.setItem("columns", JSON.stringify(this.columns));
        }
    }
});