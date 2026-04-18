<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const productos = ref<any[]>([])
const search = ref('')
const tipoFilter = ref('')
const loading = ref(true)

async function load() {
  try {
    const res = await api.get('/productos')
    productos.value = res.data
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  let list = productos.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((p: any) =>
      p.titulo.toLowerCase().includes(q) ||
      (p.autores ?? '').toLowerCase().includes(q)
    )
  }
  if (tipoFilter.value) {
    list = list.filter((p: any) => p.tipo === tipoFilter.value)
  }
  return list
})

const tipos = computed(() => [...new Set(productos.value.map((p: any) => p.tipo))])

onMounted(load)
</script>

<template>
  <div>
    <h1>Catalogo</h1>
    <div class="filters">
      <input v-model="search" placeholder="Buscar por titulo o autor..." class="search-input" />
      <select v-model="tipoFilter">
        <option value="">Todos los tipos</option>
        <option v-for="t in tipos" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Cargando catalogo...</div>

    <div v-else class="catalog-grid">
      <div v-for="p in filtered" :key="p.id_producto" class="catalog-card">
        <div class="catalog-card-body">
          <span class="badge">{{ p.tipo }}</span>
          <h3>{{ p.titulo }}</h3>
          <p class="meta">{{ p.editorial }} | {{ p.categoria }}</p>
          <p v-if="p.autores" class="authors">{{ p.autores }}</p>
          <p v-if="p.descripcion" class="desc">{{ p.descripcion }}</p>
        </div>
        <div class="catalog-card-footer">
          <span class="price">Q{{ Number(p.precio).toFixed(2) }}</span>
          <span :class="['stock', { 'stock-low': p.stock <= 5 }]">
            {{ p.stock > 0 ? `${p.stock} disponibles` : 'Agotado' }}
          </span>
        </div>
      </div>
    </div>

    <p v-if="!loading && filtered.length === 0" class="empty">No se encontraron productos.</p>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 0.75rem;
  margin: 1rem 0 1.5rem;
}
.search-input {
  flex: 1;
}
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.catalog-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.catalog-card-body {
  padding: 1rem;
  flex: 1;
}
.catalog-card-body h3 {
  margin: 0.5rem 0 0.25rem;
  font-size: 1rem;
}
.meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
.authors {
  font-size: 0.85rem;
  font-style: italic;
}
.desc {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}
.catalog-card-footer {
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border);
}
.price {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-primary);
}
.stock {
  font-size: 0.8rem;
}
.stock-low {
  color: var(--color-danger);
  font-weight: 700;
}
.empty, .loading {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}
</style>
