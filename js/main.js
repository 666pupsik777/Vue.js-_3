Vue.component('card-component', {
    props: ['card', 'columnIndex'],
    template: `
        <div class="card">
            <h3>{{ card.title || 'Без названия' }}</h3>
            <p>{{ card.description }}</p>
            <p><small>Создано: {{ card.createdAt }}</small></p>
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
        saveToLocalStorage() {
            localStorage.setItem("columns", JSON.stringify(this.columns));
        }
    }
});