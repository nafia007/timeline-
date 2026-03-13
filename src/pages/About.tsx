import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-8">About</h1>
          
          {/* Creator Bio Section */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold mb-6 text-primary">Meet the Creator</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed mb-6">
                <span className="font-semibold">Weaam Williams</span> is a South African screenwriter, director, and poet who uses cinema as her primary tool for activism, focusing on cultural identity, historical memory, and social justice. Her work is deeply personal, often exploring her own heritage as a Muslim woman with roots in Cape Town's District Six and Bo-Kaap.
              </p>
            </div>
          </section>

          {/* Filmmaking Career Section */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold mb-6 text-primary">Filmmaking Career and Major Works</h2>
            <p className="text-lg leading-relaxed mb-6">
              Weaam studied a Bachelor of Arts at the University of Cape Town, followed by further training in screenwriting and production. She is a multi-disciplinary artist who began her career as a performance poet and hip-hop MC known as "MC Desert Blossom". Her journey into film started as a screenwriter for the SABC youth drama series Soul Buddyz.
            </p>
            
            <h3 className="font-display text-xl font-semibold mb-4 mt-8">Notable Films</h3>
            <ul className="space-y-6">
              <li className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-lg">Hip-Hop Revolution (2007)</h4>
                <p className="text-muted-foreground">Her directorial debut, this documentary won the Best Edited Film Award at the NYC Reel Sisters Film Festival in 2008 with Spike Lee as Head of Jury. It has been broadcast in 28 countries.</p>
              </li>
              <li className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-lg">A Khoe Story Docu-Trilogy (2009-2013)</h4>
                <p className="text-muted-foreground">A three-part documentary series about the language, genocide, and remaining culture of South Africa's indigenous Khoe people.</p>
              </li>
              <li className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-lg">District Six Rising from the Dust (2020)</h4>
                <p className="text-muted-foreground">This autobiographical documentary documents her family's return to ancestral land in District Six after forced removals. It won multiple awards, including Best Documentary at the Wales International Film Festival and an Award of Excellence from the Scandinavian International Film Festival, and is available on Prime Video.</p>
              </li>
              <li className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-lg">Two Hues (2021)</h4>
                <p className="text-muted-foreground">Her first fiction project, which she wrote, co-directed, and starred in. The film explores the ambiguous identity of Muslim women in a Western context and makes a statement against gender-based violence. It won numerous awards, including Best Women Empowerment Film at the Berlin Short Film Festival and is being developed into a feature film.</p>
              </li>
              <li className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-lg">The Rise (2023)</h4>
                <p className="text-muted-foreground">A feature documentary shot over five years that tells the story of the Bo-Kaap community through the intersecting journeys of four individuals, capturing their experiences of community, identity, and access to land during the COVID-19 pandemic.</p>
              </li>
            </ul>
          </section>

          {/* Activism Section */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold mb-6 text-primary">Activism Through Art</h2>
            <p className="text-lg leading-relaxed mb-6">
              Weaam's activism is woven into the fabric of her storytelling. She has "found her voice as a woman and activist using cinema," and is described by City Press as a "story-teller with a conscience".
            </p>
            
            <h3 className="font-display text-xl font-semibold mb-4 mt-8">Key Themes</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">✦</span>
                <div>
                  <h4 className="font-semibold">Cultural Identity and Erasure</h4>
                  <p className="text-muted-foreground">A significant focus of her work is preserving and celebrating marginalised cultures. She addresses the erasure of her own Cape Malay identity and the Khoe indigenous culture, often highlighting that her people speak Afrikaaps and that their history is frequently overlooked.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">✦</span>
                <div>
                  <h4 className="font-semibold">Historical Memory and Dispossession</h4>
                  <p className="text-muted-foreground">Her films tackle intergenerational pain caused by forced removals in District Six, using personal narrative to explore complex politics of land and belonging.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">✦</span>
                <div>
                  <h4 className="font-semibold">Women's Rights and Patriarchy</h4>
                  <p className="text-muted-foreground">Two Hues directly confronts the duality of patriarchy and gender-based violence, winning a "Best Women Empowerment Film" award.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">✦</span>
                <div>
                  <h4 className="font-semibold">Tangible Transformation</h4>
                  <p className="text-muted-foreground">Weaam is passionate about concrete change in the industry, working to empower African filmmakers through new technologies like blockchain and advocating for more objective recognition of talent.</p>
                </div>
              </li>
            </ul>
          </section>

          {/* Industry Leadership Section */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold mb-6 text-primary">Industry Leadership and Vision</h2>
            <p className="text-lg leading-relaxed mb-6">
              Beyond directing, Weaam is a dedicated leader working to transform the film industry. She owns Tribal Alchemy Productions and Holocene Films, independent production companies in Cape Town. Her entrepreneurial spirit led her to found the African Film DAO, a blockchain-based organization using Web3 technology to empower African filmmakers, and she serves as Creative Director of the Hollywood African Cinema Connection. She is also a board member of the Independent Black Filmmakers Collective (IBFC), working to change race and gender dynamics in the South African film industry. Her work and expertise have been recognised internationally, having served as a juror for the International Emmy Awards in 2012.
            </p>
            <p className="text-lg leading-relaxed">
              Weaam draws inspiration from filmmakers like Nadine Labaki and Haile Gerima, as well as from mentors like the late human rights activist Suraya Abas. Spiritually, she views the artist as a vessel, with her work being a vehicle for a higher level of consciousness.
            </p>
          </section>

          {/* TRC Section */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold mb-6 text-primary">Truth and Reconciliation Commission</h2>
            <p className="text-lg leading-relaxed mb-6">
              Her connection to the Truth and Reconciliation Commission (TRC) is a pivotal part of her history as a young activist. At just 20 or 21 years old, Weaam Williams represented the children's rights organisation Molo Songololo at the TRC's Special Youth Hearings in Cape Town on 22 May 1997.
            </p>
            
            <h3 className="font-display text-xl font-semibold mb-4 mt-8">Her Testimony and Key Themes</h3>
            <p className="text-lg leading-relaxed mb-6">
              Speaking alongside Brian Claassen, Weaam didn't just recount individual stories of violence. Instead, she broadened the focus to the structural and systemic violations of children's rights under apartheid. Her submission highlighted how the daily infrastructure of racism caused severe mental and emotional trauma.
            </p>
            
            <p className="text-lg leading-relaxed mb-6">She addressed three main areas:</p>
            <ul className="space-y-4 ml-6 list-disc">
              <li className="text-lg">
                <span className="font-semibold">Land and Forced Removals:</span> She discussed the effects of the Group Areas Act, noting how families were moved to desolate areas like the Cape Flats. This broke down family structures and exposed children to gangs and drugs.
              </li>
              <li className="text-lg">
                <span className="font-semibold">Bantu Education:</span> She presented a powerful contrast by reading quotes from children who compared their under-resourced schools to well-funded white schools, highlighting how this instilled a belief of white supremacy.
              </li>
              <li className="text-lg">
                <span className="font-semibold">The "Apartheid Debt":</span> She argued that it was morally wrong for the new government to pay off the debt incurred by the apartheid regime, as it diverted money away from children's development.
              </li>
            </ul>

            <h3 className="font-display text-xl font-semibold mb-4 mt-8">Significance in Her Journey</h3>
            <p className="text-lg leading-relaxed">
              This testimony is a direct link to the themes she explores as a filmmaker today. Her concerns about intergenerational trauma, dispossession, and cultural identity—central to films like District Six Rising from the Dust—were already fully formed when she stood before the Commission as a young woman.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
