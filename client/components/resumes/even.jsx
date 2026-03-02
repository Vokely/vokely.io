'use client'
import styles from './even.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faMobileAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';

export const Resume =()=>{
    return (
      <div className='border border-red-400 p-2 w-[70vw]'>
        <div id="resume" className={styles.resume}>
          {/* Header */}
          <header id="header" className={`${styles.clear} ${styles.header}`}>
            <img className={styles.headerImage} src="https://avatars0.githubusercontent.com/u/416209?s=460&amp;u=38f220a2c9c658141804f881c334c594eb1642ac&amp;v=4" alt="{{name}}"/>
            <div className={styles.middle}>
              <h1 className={styles.name}>Thomas Davis</h1>
              <h2 className={styles.label}>Web Developer</h2>
            </div>
            <span className={styles.location}>
              <span className={styles.city}>Melbourne, </span>
              <span className={styles.countryCode}>AU</span>
            </span>
            {/* Contact */}
            <div id="contact" className={styles.contact}>
              <div className={styles.website}>
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                <a className={styles.hideHrefPrint} target="_blank" href="https://lordajax.com" rel="noreferrer">https://lordajax.com</a>
              </div>
              <div className={styles.email}>
                <FontAwesomeIcon icon={faEnvelope} />
                <a className={styles.hideHrefPrint} href="mailto:thomasalwyndavis@gmail.com">thomasalwyndavis@gmail.com</a>
              </div>
              <div className={styles.phone}>
                <FontAwesomeIcon icon={faMobileAlt} />
                <a className={styles.hideHrefPrint} href="tel:{{phone}}">0411021021</a>
              </div>
            </div>
            {/* Profiles */}
            <div id="profiles" className={styles.profiles}>
              <div className={styles.item}>
                <div className={styles.username}>
                  <FontAwesomeIcon icon={faTwitter} style={{ color: '#4DACE9' }} />
                  <span className={styles.url}>
                    <a target="_blank" href="https://twitter.com/ajaxdavis" rel="noreferrer">ajaxdavis</a>
                  </span>
                </div>
              </div>
              <div className={styles.item}>
                <div className={styles.username}>
                  <FontAwesomeIcon icon={faGithub}/>
                  <span className={styles.url}>
                    <a target="_blank" href="https://github.com/thomasdavis" rel="noreferrer">thomasdavis</a>
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Summary */}
          <section className={styles.section}>
            <section className={styles.mainSummary}>
              <div>
                I'm a full stack web developer who can build apps from the ground up. I've worked mostly at startups so I am used to wearing many hats. I am a very product focused developer who prioritizes user feedback first and foremost. I'm generally very flexible when investigating new roles. My publications and volunteer sections are bullshit for the purpose of showing the this theme.
              </div>
            </section>
          </section>
    
          {/* Skills */}
          <section className={styles.section}>
            <header>
              <h2 className={styles.sectionTitle}>Skills</h2>
            </header>
            <section id="skills">
              <div className={styles.item}>
                <h3 className={styles.name}>Frontend</h3>
                <div className={styles.level}><em>Senior</em><div className={styles.bar}></div></div>
                <ul className={styles.keywords}>
                  <li>HTML / JSX</li>
                  <li>SCSS / CSS / BEM / Styled Components</li>
                  <li>Javascript / Typescript</li>
                  <li>React / Next</li>
                  <li>Redux / Apollo</li>
                </ul>
              </div>
              <div className={styles.item}>
                <h3 className={styles.name}>Backend</h3>
                <div className={styles.level}><em>Senior</em><div className={styles.bar}></div></div>
                <ul className={styles.keywords}>
                  <li>Node</li>
                  <li>Ruby</li>
                  <li>Python</li>
                  <li>Postgres</li>
                  <li>Redis</li>
                  <li>Serverless</li>
                </ul>
              </div>
              <div className={styles.item}>
                <h3 className={styles.name}>Devops</h3>
                <div className={styles.level}><em>Senior</em><div className={styles.bar}></div></div>
                <ul className={styles.keywords}>
                  <li>AWS</li>
                  <li>G Cloud</li>
                  <li>Heroku</li>
                  <li>Caching</li>
                </ul>
              </div>
            </section>
          </section>
    
          {/* Experience */}
          <section className={styles.section}>
            <header>
              <h2 className={styles.sectionTitle}>Work Experience <span className={styles.itemCount}>(11)</span></h2>
            </header>
            <section id="work">
              <section className={styles.workItem}>
                <label for="work-item-0"></label>
                <header className={styles.clear}>
                  <div className={styles.date}>
                    <span className={styles.startDate}>May 2020</span>
                    <span className={styles.endDate}>- Current</span>
                  </div>
                  <div className={styles.position}>Product Engineer</div>
                  <div className={styles.company}>Misc Companies</div>
                </header>
                <span className={styles.fas}></span>
                <span className={styles.location}>Melbourne</span>
                <div className={styles.item} id="work-item">
                  <div className={styles.summary}>
                    Over the past several years, I've worked at various roles and companies. Mostly early stage startups, doing full stack product development.
                  </div>
                  <ul className={styles.highlights}>
                    <li>React / Next</li>
                    <li>Node / Laravel</li>
                    <li>LLM's</li>
                    <li>Diagrams / Canvas</li>
                  </ul>
                </div>
              </section>
              <section className={styles.workItem}>
                <label for="work-item-1"></label>
                <header className={styles.clear}>
                  <div className={styles.date}>
                    <span className={styles.startDate}>May 2020</span>
                    <span className={styles.endDate}>- May 2021</span>
                  </div>
                  <div className={styles.position}>Senior Javascript Developer</div>
                  <div className={styles.company}>Tokenized</div>
                </header>
                <span className={styles.fas}></span>
                <span className={styles.location}>Melbourne</span>
                <div className={styles.item} id="work-item">
                  <div className={styles.summary}>
                    Tokenized is a Bitcoin wallet for issuing, managing and trading digital tokens. I built out the front end which was packaged as an electron app. It was a difficult frontend to build because we store the users keys locally and used them to sign transactions and contracts.
                  </div>
                  <ul className={styles.highlights}>
                    <li>React</li>
                    <li>Redux</li>
                    <li>SCSS</li>
                    <li>Product</li>
                  </ul>
                </div>
              </section>
            </section>
          </section>
    
          {/* PROJECTS */}
          <section className={styles.section}>
              <header>
                <h2 className={styles.sectionTitle}>Projects <span className={styles.itemCount}>(2)</span></h2>
              </header>
              <section id="projects">
                <section className={styles.projectItem}>
                  <label for="project-item-0"></label>
                  <header className={styles.clear}>
                    <div className={styles.position}>JSON Resume</div>
                    <div className={styles.date}>
                      <span className={styles.startDate}>Apr 2014</span>
                      <span className={styles.endDate}>- Current</span>
                    </div>
                  </header>
                  <div className={styles.item}>
                    <div className={styles.summary}>
                      JSON Resume is a community driven open source initiative to create a JSON based standard for resumes. There is no reason why there can't be a common standard for writing a resume that can be extended with an ecosystem of open source tools.
                    </div>
                    <ul className={styles.highlights}>
                      <li>This resume is built with JSON Resume</li>
                      <li>Over 3000 stars on Github</li>
                      <li>Community developed themes</li>
                      <li>Tens of thousands of users</li>
                    </ul>
                  </div>
                </section>
                <section className={styles.projectItem}>
                  <label for="project-item-1"></label>
                  <header className={styles.clear}>
                    <div className={styles.position}>Cdnjs</div>
                    <div className={styles.date}>
                      <span className={styles.startDate}>Jan 2011</span>
                      <span className={styles.endDate}>- Current</span>
                    </div>
                  </header>
                  <div className={styles.item}>
                    <div className={styles.summary}>
                      Following Google's CDN for jQuery, we decided to start a CDN for the less popular Javascript frameworks. The CDN is community moderated and open source on GitHub. We secured a partnership with Cloudflare who now supports the infrastructure.
                    </div>
                    <ul className={styles.highlights}>
                      <li>Millions of sites use the CDN in production</li>
                      <li>Larger market share than Yahoo's, Microsoft's and Google's javascript content distribution networks</li>
                      <li>We serve hundreds of billions request a month</li>
                      <li>Contains over 3000 popular Javascript libraries</li>
                      <li>Millions of developers visit the site per year</li>
                    </ul>
                  </div>
                </section>
              </section>
          </section>
      
          {/* Volunteer */}
          <section className={styles.section}>
            <header>
              <h2 className={styles.sectionTitle}>Volunteer</h2>
            </header>
            <section id="volunteer">
              <section className={styles.volunteerItem}>
                <label for="volunteer-item-0"></label>
                <header className={styles.clear}>
                  <div className={styles.date}>
                    <span className={styles.startDate}>1/1/2016</span>
                    <span className={styles.endDate}>- Current</span>
                  </div>
                  <div className={styles.headerLeft}>
                    <div className={styles.position}>Contributor</div>
                    <div className={styles.organization}>Open Source Project</div>
                  </div>
                </header>
                <div className={styles.website}>
                  <span className={styles.fas}></span>
                  <a target="_blank" href="http://opensourceproject.com" rel="noreferrer">http://opensourceproject.com</a>
                </div>
                <div className={styles.item}>
                  <div className={styles.summary}>
                    Contributing to open source projects to improve software quality.
                  </div>
                  <ul className={styles.highlights}>
                    <li>Fixed critical bugs and added new features.</li>
                    <li>Mentored new contributors.</li>
                  </ul>
                </div>
              </section>
            </section>
          </section>
    
          {/* Education */}
          <section className={styles.section}>
              <header>
                <h2 className={styles.sectionTitle}>Education <span className={styles.itemCount}>(2)</span></h2>
              </header>
              <section id="education">
                <section className={styles.educationItem}>
                  <header className={styles.clear}>
                    <div className={styles.date}>
                      <span className={styles.startDate}>2008</span>
                      <span className={styles.endDate}>- 2009</span>
                    </div>
                    <div className={styles.headerLeft}>
                      <div className={styles.studyType}>Bachelors</div>
                      <div className={styles.area}>Software Engineering (incomplete)</div>
                      <div className={styles.institution}>The University of Queensland</div>
                    </div>
                  </header>
                  <div className={styles.item}></div>
                </section>
                <section className={styles.educationItem}>
                  <header className={styles.clear}>
                    <div className={styles.date}>
                      <span className={styles.startDate}>2010</span>
                      <span className={styles.endDate}>- 2014</span>
                    </div>
                    <div className={styles.headerLeft}>
                      <div className={styles.studyType}>Bachelor</div>
                      <div className={styles.area}>Computer Science</div>
                      <div className={styles.institution}>University of Technology</div>
                    </div>
                  </header>
                  <ul className={styles.courses}>
                    <li>CS101 - Introduction to Computer Science</li>
                    <li>CS201 - Data Structures and Algorithms</li>
                    <li>CS301 - Operating Systems</li>
                  </ul>
                  <div className={styles.item}>
                    <div className={styles.gpa}><strong>Grade:</strong> <span>3.8 GPA</span></div>
                  </div>
                </section>
              </section>
          </section>
    
          {/* Awards */}
          <section className={styles.section}>
              <header>
                <h2 className={styles.sectionTitle}>Awards</h2>
              </header>
              <section id="awards">
                <section className={styles.awardItem}>
                  <label for="award-item-0"></label>
                  <header className={styles.clear}>
                    <div className={styles.date}>2014</div>
                    <div className={styles.headerLeft}>
                      <div className={styles.title}>Defender of the Internet</div>
                      <div className={styles.awarder}>Fight For The Future</div>
                    </div>
                  </header>
                  <div className={styles.item}>
                    <div className={styles.summary}>
                      For my work against mass surveillance and building out civic tools for digital democracy.
                    </div>
                  </div>
                </section>
              </section>
          </section>
    
          {/* Certificates */}
          <section className={styles.section}>
              <header>
                <h2 className={styles.sectionTitle}>Certificates</h2>
              </header>
              <section id="certificates">
                <section className={styles.certificateItem}>
                  <header className={styles.clear}>
                    <div className={styles.date}>2021-05-01</div>
                    <div className={styles.headerLeft}>
                      <div className={styles.name}>Certified Kubernetes Administrator</div>
                      <div className={styles.issuer}>Cloud Native Computing Foundation</div>
                    </div>
                  </header>
                  <div className={styles.item}>
                    <span className={styles.url}>
                      <span className={styles.fas}></span>
                      <a target="_blank" rel="noopener noreferrer" href="http://certificates.com/kubernetes">http://certificates.com/kubernetes</a>
                    </span>
                  </div>
                </section>
              </section>
          </section>
    
          {/* Publications */}
            <section className={styles.section}>
              <header>
                <h2 className={styles.sectionTitle}>Publications</h2>
              </header>
              <section id="publications">
                <section className={styles.publicationItem}>
                  <label for="publication-item-0"></label>
                  <header className={styles.clear}>
                    <span className={styles.date}>1 Aug 2019</span>
                    <div className={styles.headerLeft}>
                      <span className={styles.name}>
                        <span className={styles.website}>
                          <span className={styles.fas}></span>
                          <a target="_blank" href="http://techbookspublishing.com/advanced-javascript" rel="noreferrer">Advanced JavaScript Techniques</a>
                        </span>
                      </span>
                      <span className={styles.publisher}>in Tech Books Publishing</span>
                    </div>
                  </header>
                  <div className={styles.item}>
                    <div className={styles.summary}>
                      A comprehensive guide to modern JavaScript development.
                    </div>
                  </div>
                </section>
              </section>
            </section>
    
          {/* Languages */}
          <section className={styles.section}>
            <header>
              <h2 className={styles.sectionTitle}>Languages</h2>
            </header>
            <section id="languages">
              <div className={styles.display}>
                <h3 className={styles.language}>English</h3>
                <div className={styles.item}>
                  <div className={styles.level}><em>Native speaker</em><div className={styles.bar}></div></div>
                </div>
              </div>
            </section>
          </section>
    
          {/* Interests */}
          <section className={styles.section}>
            <header>
              <h2 className={styles.sectionTitle}>Interests</h2>
            </header>
            <section id="interests">
              <div className={styles.item}>
                <h3 className={styles.name}>Gardening</h3>
                <ul className={styles.keywords}>
                  <li>Lazy Gardening</li>
                </ul>
              </div>
              <div className={styles.item}>
                <h3 className={styles.name}>Music</h3>
                <ul className={styles.keywords}>
                  <li>Guitar</li>
                  <li>Singing</li>
                  <li>Dancing</li>
                </ul>
              </div>
              <div className={styles.item}>
                <h3 className={styles.name}>Books</h3>
                <ul className={styles.keywords}>
                  <li>Reading</li>
                  <li>Writing</li>
                  <li>History</li>
                </ul>
              </div>
              <div className={styles.item}>
                <h3 className={styles.name}>Open Source</h3>
                <ul className={styles.keywords}>
                  <li>All of it</li>
                </ul>
              </div>
            </section>
          </section>
      
          {/* References */}
          <section className={styles.section}>
            <header>
              <h2 className={styles.sectionTitle}>References</h2>
            </header>
            <section id="references">
              <div className={styles.item}>
                <blockquote className={styles.reference}>
                  “Thomas was hired as a lead developer and, upon the leaving of our co-founder took over as CTO of Earbits. Thomas is, hands down, one of those A Players you hear of companies dying to hire. He is incredibly smart, not just at code but about everything from classNameical music to Chinese language and culture. Thomas is great to work with and, as a well established contributor to open source projects and several successful ventures, commands the respect of engineers at all levels. I would suggest doing anything you can to have him on your team.”
                  <div className={styles.name}>Joey Flores, Co-founder and CEO of Earbits, Inc.</div>
                </blockquote>
              </div>
            </section>
          </section>
          {/* EO Resume */}
        </div>  
        {/* Page */}
      </div>
  )
};