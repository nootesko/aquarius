import { Nav } from './components/Nav.jsx'
import { FloatingWhatsApp } from './components/FloatingWhatsApp.jsx'
import { Hero } from './sections/Hero.jsx'
import { Solution } from './sections/Solution.jsx'
import { Proposals } from './sections/Proposals.jsx'
import { Team } from './sections/Team.jsx'
import { ChangeCta } from './sections/ChangeCta.jsx'
import { InstagramFeed } from './sections/InstagramFeed.jsx'
import { Contact } from './sections/Contact.jsx'
import { Closing } from './sections/Closing.jsx'

export default function App() {
  return (
    <>
      <Nav />
      <main id="conteudo">
        <Hero />
        <Solution />
        <Proposals />
        <Team />
        <ChangeCta />
        <InstagramFeed />
        <Contact />
      </main>
      <Closing />
      <FloatingWhatsApp />
    </>
  )
}
