import React from 'react'
import s from './index.module.css'
import reduceToElements from '../../compute/elements'

const elements = {water: '🜄', fire: '🜂', earth: '🜃', air: '🜁'}

const ElementsTable = ({horoscope}) => {
  return (
    <div className={s.elements}>
      <table>
        <tbody>
          {Object.entries(reduceToElements(horoscope))
            .sort((a, b) => b[1] - a[1])
            .map(([s, v]) => (
              <tr key={s}>
                <td>{elements[s]}</td>
                <td>{v}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default ElementsTable
