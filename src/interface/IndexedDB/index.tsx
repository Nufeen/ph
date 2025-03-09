import {useState, useEffect, useCallback, useContext} from 'react'

import s from './index.module.css'
import {CelestialContext} from '../../CelestialContext'

import {openDB} from 'idb'

async function readDB() {
  const db = await openDB('astro-ph-db1', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('people')) {
        db.createObjectStore('people', {keyPath: 'name'})
      }
    }
  })
  const data = await db.getAll('people')
  return data
}

export default function DbScreen(props) {
  const {natalData, transitData} = useContext(CelestialContext)

  const [people, getPeople] = useState([])
  const [rnd, updateState] = useState(0)

  const forceUpdate = useCallback(
    () => updateState(_ => Math.random()),
    []
  )

  useEffect(() => {
    const f = async () => {
      const response = await readDB()
      getPeople(response)
    }
    f()
  }, [rnd])

  const handleDelete = (person: Person) => {
    deletePerson(person).then(() => {
      forceUpdate()
    })
  }

  const [searchTerm, setSearchTerm] = useState('')

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={s.wrap}>
      {filteredPeople.length > 10 && (
        <div className="search-input">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      <div className={s.db}>
        {filteredPeople.map(person => (
          <div key={person.name} className={s.personContainer}>
            <div
              className={s.name}
              onClick={() => {
                props.setNatalData({
                  ...natalData,
                  name: person.name,
                  date: person.date,
                  city: person.city,
                  country: person.country
                })
                props.setDbScreenVisible(false)
              }}
            >
              {person.name}
            </div>
            <div className={s.date}>
              {person.date.toLocaleString()}
            </div>

            <div className={s.date}>
              {person.city}, {person.country}
            </div>
            <button
              className={s.button}
              onClick={() => handleDelete(person)}
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Person {
  name: string
  date: Date
}

const deletePerson = async (person: Person) => {
  const db = await openDB('astro-ph-db1', 1)
  const tx = db.transaction(['people'], 'readwrite')
  const store = tx.objectStore('people')
  await store.delete(person.name)
  await tx.done
}
