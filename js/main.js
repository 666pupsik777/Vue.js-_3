Vue.component('card-component', {
    props: ['card', 'columnIndex'],
    template: `
        <div class="card">
            <h3>{{ card.title || 'Новая задача' }}</h3>
        </div>
    `
});

Vue.component('column-component', {
    props: ['column', 'columnIndex'],
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <div class="cards">
                <card-component 
                    v-for="card in column.cards" 
                    :key="card.id" 
                    :card="card" 
                    :column-index="columnIndex">
                </card-component>
            </div>
        </div>
    `
});

// Код экземпляра 'app' из 1-го коммита остается ниже