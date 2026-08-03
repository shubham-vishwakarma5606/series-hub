import { searchCatalog, SHOWS } from '../data/catalog.js'
import Card from './Card.jsx'

export default function SearchPage ({ query, onQuery, handlers }) {
  const results = searchCatalog(query)
  const related = [...new Set(results.slice(0, 4).flatMap((s) => s.genres))].slice(0, 5)
  const fallback = [...SHOWS].sort((a, b) => b.match - a.match).slice(0, 12)

  return (
    <main className="search-page">
      <div className="sp-inner">
        {!query.trim() && (
          <>
            <p className="sp-explore">Explore titles related to:&nbsp;
              {['Sci-Fi', 'Crime', 'Comedy', 'Horror', 'Noir'].map((g) => (
                <button key={g} className="sp-chip" onClick={() => onQuery(g)}>{g}</button>
              ))}
            </p>
            <h3 className="sp-h">More to explore</h3>
            <div className="sp-grid">
              {fallback.map((s) => <Card key={s.id} show={s} variant="land" {...handlers} />)}
            </div>
          </>
        )}

        {query.trim() && results.length > 0 && (
          <>
            <p className="sp-explore">Explore titles related to:&nbsp;
              {related.map((g) => (
                <button key={g} className="sp-chip" onClick={() => onQuery(g)}>{g}</button>
              ))}
            </p>
            <div className="sp-grid">
              {results.map((s) => <Card key={s.id} show={s} variant="land" {...handlers} />)}
            </div>
          </>
        )}

        {query.trim() && results.length === 0 && (
          <div className="sp-none">
            <p>Your search for “<b>{query}</b>” did not have any matches.</p>
            <p className="dim">Suggestions:</p>
            <ul>
              <li>Try different keywords</li>
              <li>Looking for a film or TV show?</li>
              <li>Try a genre, like Sci-Fi, Crime or Comedy</li>
            </ul>
            <div className="sp-grid">
              {fallback.map((s) => <Card key={s.id} show={s} variant="land" {...handlers} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
