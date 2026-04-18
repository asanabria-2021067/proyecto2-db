<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const emit = defineEmits<{
  save: [data: any]
  cancel: []
}>()

const open = ref(true)
const clientes = ref<any[]>([])
const productos = ref<any[]>([])
const clienteId = ref('')
const items = ref<{ producto_id: string; cantidad: number; precio_unitario: number }[]>([])
const error = ref('')

onMounted(async () => {
  const [cRes, pRes] = await Promise.all([
    api.get('/clientes'),
    api.get('/productos'),
  ])
  clientes.value = cRes.data
  productos.value = pRes.data
})

function addItem() {
  items.value.push({ producto_id: '', cantidad: 1, precio_unitario: 0 })
}

function removeItem(i: number) {
  items.value.splice(i, 1)
}

function onProductoChange(i: number, val: string) {
  const item = items.value[i]!
  item.producto_id = val
  const prod = productos.value.find((p: any) => String(p.id_producto) === val)
  if (prod) {
    item.precio_unitario = Number(prod.precio)
  }
}

const total = computed(() =>
  items.value.reduce((sum, it) => sum + it.cantidad * it.precio_unitario, 0)
)

function submit() {
  error.value = ''
  if (!clienteId.value) {
    error.value = 'Seleccione un cliente'
    return
  }
  if (items.value.length === 0) {
    error.value = 'Agregue al menos un producto'
    return
  }
  for (const item of items.value) {
    if (!item.producto_id || item.cantidad <= 0) {
      error.value = 'Todos los items deben tener producto y cantidad > 0'
      return
    }
  }
  emit('save', {
    cliente_id: Number(clienteId.value),
    empleado_id: null,
    items: items.value.map(it => ({
      producto_id: Number(it.producto_id),
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario,
    })),
  })
}

function handleOpenChange(val: boolean) {
  if (!val) emit('cancel')
  open.value = val
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nueva Venta</DialogTitle>
      </DialogHeader>

      <div v-if="error" class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ error }}
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div class="space-y-2">
          <Label>Cliente *</Label>
          <Select v-model="clienteId">
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in clientes" :key="c.id_cliente" :value="String(c.id_cliente)">
                {{ c.nombre }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex items-center justify-between">
          <Label class="text-base font-semibold">Productos</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="transition-all duration-200 hover:border-primary/50 hover:text-primary hover:bg-primary/5"
            @click="addItem"
          >
            + Agregar
          </Button>
        </div>

        <div v-if="items.length" class="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">
                <TableHead>Producto</TableHead>
                <TableHead class="w-24">Cantidad</TableHead>
                <TableHead class="text-right">Precio Unit.</TableHead>
                <TableHead class="text-right">Subtotal</TableHead>
                <TableHead class="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(item, i) in items" :key="i" class="transition-colors duration-150 hover:bg-muted/50">
                <TableCell>
                  <Select :model-value="item.producto_id" @update:model-value="(v: string) => onProductoChange(i, v)">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="p in productos" :key="p.id_producto" :value="String(p.id_producto)">
                        {{ p.titulo }} (stock: {{ p.stock }})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input v-model.number="item.cantidad" type="number" min="1" class="w-20" />
                </TableCell>
                <TableCell class="text-right font-mono">Q{{ item.precio_unitario.toFixed(2) }}</TableCell>
                <TableCell class="text-right font-mono font-medium">Q{{ (item.cantidad * item.precio_unitario).toFixed(2) }}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="h-7 w-7 p-0 text-destructive border-destructive/30 transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive"
                    @click="removeItem(i)"
                  >
                    X
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div class="text-right text-lg font-bold border-t pt-3">
          Total: <span class="text-primary">Q{{ total.toFixed(2) }}</span>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" class="transition-all duration-200 hover:bg-muted" @click="emit('cancel')">Cancelar</Button>
          <Button type="submit" class="transition-all duration-200 hover:scale-105 hover:shadow-md">Registrar Venta</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
