const DEMO_GUESTS_KEY = 'diamora_demo_guests'
const DEMO_WISHES_KEY = 'diamora_demo_wishes'

const initialGuests = [
  {
    id: 1,
    nama: 'Joko & Partner',
    no_wa: '',
    pax: 2,
    kategori: 'Teman Kantor',
    rsvp_status: 'belum_respon',
    kirim_status: 'belum_dikirim',
    link_personal: 'https://diamora.test/danu-fifi?to=joko-partner',
  },
  {
    id: 2,
    nama: 'Budi Santoso',
    no_wa: '081234567890',
    pax: 2,
    kategori: 'Keluarga',
    rsvp_status: 'hadir',
    kirim_status: 'terkirim',
    link_personal: 'https://diamora.test/danu-fifi?to=budi-santoso',
  },
  {
    id: 3,
    nama: 'Siti Rahma',
    no_wa: '081987654321',
    pax: 1,
    kategori: 'Sahabat',
    rsvp_status: 'hadir',
    kirim_status: 'belum_dikirim',
    link_personal: 'https://diamora.test/danu-fifi?to=siti-rahma',
  },
  {
    id: 4,
    nama: 'Andi Pratama',
    no_wa: '085712345678',
    pax: 2,
    kategori: 'Teman Kuliah',
    rsvp_status: 'ragu',
    kirim_status: 'terkirim',
    link_personal: 'https://diamora.test/danu-fifi?to=andi-pratama',
  },
  {
    id: 5,
    nama: 'Dewi Lestari',
    no_wa: '081398765432',
    pax: 1,
    kategori: 'Teman SMA',
    rsvp_status: 'tidak_hadir',
    kirim_status: 'belum_dikirim',
    link_personal: 'https://diamora.test/danu-fifi?to=dewi-lestari',
  },
  {
    id: 6,
    nama: 'Rian Ardianto',
    no_wa: '082155566778',
    pax: 2,
    kategori: 'Teman Kantor',
    rsvp_status: 'hadir',
    kirim_status: 'terkirim',
    link_personal: 'https://diamora.test/danu-fifi?to=rian-ardianto',
  },
  {
    id: 7,
    nama: 'Keluarga Besar Bpk. Hendra',
    no_wa: '081223344556',
    pax: 4,
    kategori: 'Keluarga',
    rsvp_status: 'belum_respon',
    kirim_status: 'belum_dikirim',
    link_personal: 'https://diamora.test/danu-fifi?to=keluarga-hendra',
  },
]

const initialWishes = [
  {
    id: 1,
    nama: 'Budi Santoso',
    pesan: 'Selamat menempuh hidup baru Danu dan Fifi! Semoga selalu diberkahi kebahagiaan, sakinah mawaddah warahmah sampai maut memisahkan.',
    waktu: '2 jam lalu',
    tersembunyi: false,
  },
  {
    id: 2,
    nama: 'Siti Rahma',
    pesan: 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fii khoir. Lancar sampai hari H yaa bestie!',
    waktu: '5 jam lalu',
    tersembunyi: false,
  },
  {
    id: 3,
    nama: 'Rian Ardianto',
    pesan: 'Happy wedding brother! Selamat memulai babak baru bersama Fifi. Semoga langgeng dan bahagia selalu!',
    waktu: '1 hari lalu',
    tersembunyi: false,
  },
  {
    id: 4,
    nama: 'Anonim',
    pesan: 'Doa terbaik untuk kedua mempelai yang berbahagia.',
    waktu: '2 hari lalu',
    tersembunyi: true,
  },
]

function getStoredGuests() {
  try {
    const raw = localStorage.getItem(DEMO_GUESTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* empty */
  }
  return initialGuests
}

function saveStoredGuests(items) {
  try {
    localStorage.setItem(DEMO_GUESTS_KEY, JSON.stringify(items))
  } catch {
    /* empty */
  }
}

function getStoredWishes() {
  try {
    const raw = localStorage.getItem(DEMO_WISHES_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* empty */
  }
  return initialWishes
}

function saveStoredWishes(items) {
  try {
    localStorage.setItem(DEMO_WISHES_KEY, JSON.stringify(items))
  } catch {
    /* empty */
  }
}

export function handleMockApi(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const body = options.body || {}

  // 1. Auth login
  if (path.startsWith('/auth/login')) {
    return {
      token: 'demo-token',
      user: {
        display_name: 'Client Demo',
        user_email: 'client_demo@diamora.test',
        user_login: 'client_demo',
      },
    }
  }

  // 1b. Magic login
  if (path.startsWith('/auth/magic-login')) {
    return {
      valid: true,
      token: body.token || 'demo-token',
      user: {
        display_name: 'Client Demo',
        user_email: 'client_demo@diamora.test',
        user_login: 'client_demo',
      },
      undangan: {
        id: 1,
        judul: 'Danu & Fifi',
        mempelai: 'Danu & Fifi',
        slug: 'danu-fifi',
        link: 'https://diamora.test/danu-fifi',
      },
    }
  }

  // 2. /me
  if (path === '/me') {
    return {
      user: {
        display_name: 'Client Demo',
        user_email: 'client_demo@diamora.test',
        user_login: 'client_demo',
      },
      undangan: {
        id: 1,
        judul: 'Danu & Fifi',
        mempelai: 'Danu & Fifi',
        event_date: '2026-12-25 09:00:00',
        slug: 'danu-fifi',
        link: 'https://diamora.test/danu-fifi',
      },
    }
  }

  // 3. /stats
  if (path === '/stats') {
    const guests = getStoredGuests()
    const wishes = getStoredWishes()
    const hadir = guests.filter((g) => g.rsvp_status === 'hadir').length
    const tidakHadir = guests.filter((g) => g.rsvp_status === 'tidak_hadir').length
    const ragu = guests.filter((g) => g.rsvp_status === 'ragu').length
    const belumRespon = guests.filter((g) => g.rsvp_status === 'belum_respon').length
    const sentCount = guests.filter((g) => g.kirim_status === 'terkirim').length
    const totalPax = guests.reduce((sum, g) => sum + (Number(g.pax) || 1), 0)

    return {
      total_guests: guests.length,
      total_pax: totalPax,
      sent_count: sentCount,
      rsvp: {
        hadir,
        tidak_hadir: tidakHadir,
        ragu,
        belum_respon: belumRespon,
      },
      total_wishes: wishes.length,
      activity: [
        { id: 1, text: 'Budi Santoso mengonfirmasi hadir (2 orang)', time: '10 menit lalu' },
        { id: 2, text: 'Undangan terkirim ke Andi Pratama via WhatsApp', time: '1 jam lalu' },
        { id: 3, text: 'Ucapan baru dari Siti Rahma', time: '5 jam lalu' },
      ],
    }
  }

  // 4. /guests
  if (path.startsWith('/guests')) {
    const guests = getStoredGuests()

    // POST: Tambah tamu
    if (method === 'POST') {
      const newGuest = {
        id: Date.now(),
        nama: body.nama || 'Tamu Baru',
        no_wa: body.no_wa || '',
        pax: Number(body.pax) || 1,
        kategori: body.kategori || 'Umum',
        rsvp_status: 'belum_respon',
        kirim_status: 'belum_dikirim',
        link_personal: `https://diamora.test/danu-fifi?to=${encodeURIComponent(
          (body.nama || 'tamu').toLowerCase().replace(/\s+/g, '-')
        )}`,
      }
      const updated = [newGuest, ...guests]
      saveStoredGuests(updated)
      return newGuest
    }

    // PUT: Update tamu (/guests/123)
    const matchId = path.match(/\/guests\/(\d+)/)
    if (matchId && method === 'PUT') {
      const gId = Number(matchId[1])
      const updated = guests.map((g) => (g.id === gId ? { ...g, ...body } : g))
      saveStoredGuests(updated)
      return updated.find((g) => g.id === gId) || {}
    }

    // DELETE: Hapus tamu
    if (matchId && method === 'DELETE') {
      const gId = Number(matchId[1])
      const updated = guests.filter((g) => g.id !== gId)
      saveStoredGuests(updated)
      return { success: true }
    }

    // GET list with params
    const url = new URL(`http://dummy${path}`)
    const search = (url.searchParams.get('search') || '').toLowerCase()
    const rsvp = url.searchParams.get('rsvp')

    let filtered = guests.filter((g) => {
      if (search && !g.nama.toLowerCase().includes(search)) return false
      if (rsvp && rsvp !== 'semua' && g.rsvp_status !== rsvp) return false
      return true
    })

    return {
      items: filtered,
      page: 1,
      pages: 1,
      total: filtered.length,
    }
  }

  // 5. /wishes
  if (path.startsWith('/wishes')) {
    const wishes = getStoredWishes()

    // PUT: Toggle wish visibility
    const matchId = path.match(/\/wishes\/(\d+)/)
    if (matchId && method === 'PUT') {
      const wId = Number(matchId[1])
      const updated = wishes.map((w) =>
        w.id === wId ? { ...w, tersembunyi: body.tersembunyi ?? !w.tersembunyi } : w
      )
      saveStoredWishes(updated)
      return updated.find((w) => w.id === wId) || {}
    }

    return {
      items: wishes,
      total: wishes.length,
      page: 1,
      pages: 1,
    }
  }

  // 6. /me/password
  if (path === '/me/password') {
    return { success: true, message: 'Password berhasil diperbarui.' }
  }

  return { success: true }
}
