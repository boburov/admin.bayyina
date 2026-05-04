# Native HTML elementlarini Shared Componentlarga almashtirish

Siz `bayyina` React loyihasida ishlayapsiz. Vazifangiz — berilgan fayl(lar)dagi oddiy HTML `<input>`, `<select>` va `<button>` teglarini topib, loyihaning tayyor shared componentlari bilan almashtirish.

## Qoidalar

- Hech qachon `<input>`, `<select>`, `<button>` teglarini to'g'ridan-to'g'ri ishlatmang. Doimo quyidagi shared componentlardan foydalaning.
- `options` massivlari JSX ichida yoki komponent tanasida inline yozilmasin. Ularni yonidagi `*.data.js` fayliga ko'chiring va import qiling (CLAUDE.md qoidasi).
- Almashtirish bilan bog'liq bo'lmagan mantiq, holat yoki stillarni o'zgartirmang.
- Kerak bo'lmagan qo'shimcha proplar qo'shmang.
- Mavjud barcha proplarni (`value`, `onChange`, `disabled`, `placeholder`, `className` va h.k.) yangi komponentning API'siga to'g'ri moslashtiring.

---

## Komponentlar bo'yicha yo'riqnoma

### `<button>` → `Button`

**Import:** `import Button from "@/shared/components/ui/button/Button";`

**Proplar:**
- `variant`: `"default"` | `"outline"` | `"secondary"` | `"danger"` | `"ghost"` | `"link"`
- `size`: `"default"` | `"sm"` | `"lg"` | `"icon"`
- `playClickSound`: boolean (standart `true`) — faqat kerak bo'lsa `false` qiling
- Barcha standart HTML button atributlari (`type`, `onClick`, `disabled` va h.k.)

**Qaysi variant qachon:**
- Asosiy / saqlash tugmalari → `variant="default"`
- Bekor qilish / ikkinchi darajali tugmalar → `variant="outline"`
- O'chirish / xavfli amallar → `variant="danger"`

```jsx
// Oldin
<button type="submit" onClick={handleSave} className="bg-brown-800 text-white px-4">Saqlash</button>

// Keyin
<Button type="submit" onClick={handleSave}>Saqlash</Button>
```

---

### `<input>` → `InputField`

**Import:** `import InputField from "@/shared/components/ui/input/InputField";`

**Proplar:**
- `name`: string — majburiy
- `label`: string — inputdan yuqorida ko'rsatiladigan yorliq
- `description`: string — inputdan pastda yordamchi matn
- `required`: boolean — labelga qizil `*` qo'shadi
- `inputClassName`: string — ichki input elementiga className
- `className`: string — tashqi konteynerga className
- `type`: qaysi sub-komponent render qilinishini belgilaydi:

| `type` qiymati | Render qilinadigan komponent | Xususiyat |
|---|---|---|
| `"password"` | `InputPwd` | Ko'rish/yashirish tugmasi |
| `"tel"` | `InputTel` | `+998 (XX) XXX-XX-XX` niqobi |
| `"otp"` | `InputOtp` | Slot-based raqam inputi |
| Boshqa | `Input` | Oddiy input |

```jsx
// Oldin
<label htmlFor="name">Ism *</label>
<input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ism kiriting" />

// Keyin
<InputField
  name="name"
  label="Ism"
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Ism kiriting"
  required
/>
```

**Bir nechta inputni yonma-yon joylashtirish uchun `InputGroup` ishlatilsin:**

**Import:** `import InputGroup from "@/shared/components/ui/input/InputGroup";`

```jsx
<InputGroup>
  <InputField name="firstName" label="Ism" value={...} onChange={...} required />
  <InputField name="lastName" label="Familiya" value={...} onChange={...} required />
</InputGroup>
```

---

### `<select>` → `SelectField`

**Import:** `import SelectField from "@/shared/components/ui/select/SelectField";`

**Proplar:**
- `name`: string — majburiy
- `label`: string — selectdan yuqorida yorliq
- `options`: `{ value: string, label: string }[]` — **`*.data.js` faylidan import qilinsin, inline yozilmasin**
- `value`: string — boshqariladigan qiymat
- `onChange`: `(value: string) => void` — event emas, qiymatning o'zi keladi
- `placeholder`: string
- `required`: boolean
- `description`: string
- `isLoading`: boolean
- `disabled`: boolean
- `searchable`: boolean — variantlar ko'p bo'lsa ishlating (ichida `SelectSearch`ga o'tadi)

```jsx
// Oldin
<label>Holat</label>
<select value={status} onChange={(e) => setStatus(e.target.value)}>
  <option value="">Tanlang</option>
  <option value="active">Faol</option>
  <option value="inactive">Nofaol</option>
</select>

// Keyin — options ni *.data.js ga ko'chiring:
// fayl: some-component.data.js
export const statusOptions = [
  { value: "active", label: "Faol" },
  { value: "inactive", label: "Nofaol" },
];

// fayl: SomeComponent.jsx
// Select ichidagi value bo'sh bo'lmasligi kerak, placeholder uchun alohida prop bor
import { statusOptions } from "./some-component.data.js";
import SelectField from "@/shared/components/ui/select/SelectField";

<SelectField
  name="status"
  label="Holat"
  options={statusOptions}
  value={status}
  onChange={(val) => setStatus(val)}
  placeholder="Tanlang"
/>
```

**`onChange` farqi:** Native `<select>` `e.target.value` beradi, `SelectField` esa qiymatni to'g'ridan-to'g'ri beradi:
```jsx
// Oldin:  onChange={(e) => setStatus(e.target.value)}
// Keyin:  onChange={(val) => setStatus(val)}
```

---

## Bajarish tartibi

1. Berilgan faylni to'liq o'qing.
2. Barcha `<input>`, `<select>`, `<button>` native elementlarini aniqlang.
3. Har bir element uchun to'g'ri shared komponent va proplarni tanlang.
4. Inline yozilgan `options` massivlari bormi — bo'lsa, yonidagi `*.data.js` faylini yarating yoki yangilang.
5. Faylning yuqorisiga kerakli importlarni qo'shing.
6. Almashtirishlarni amalga oshiring.
7. Oxirida qisqa hisobot bering: qaysi elementlar almashtirildi, nima `*.data.js`ga ko'chirildi, qanday qarorlar qabul qilindi.
