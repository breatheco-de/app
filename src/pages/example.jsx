import styles from '../../styles/Home.module.css';
import { isDevMode } from '../utils';
import MktInfoCards from '../components/MktInfoCards';
import MktTrustCards from '../components/MktTrustCards';
import MktTestimonials from '../components/MktTestimonials';

export const getStaticProps = () => {
  if (!isDevMode) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      seo: {
        unlisted: true,
      },
    },
  };
};

export default function Example() {
  const description = `The current traditional teaching methods focus on theoretical aspects, neglecting hands-on experience and student engagement, leading to high dropout rates and slow skill acquisition. Bootcamps and similar platforms offer faster, more interactive learning but lack a scientific approach.

  <br><br>Learn to code collaborating with others and become a developer to get your first job in tech.
  `;

  const cardDescription = 'Hundreds of interactive exercises, projects, and lessons are available thanks to LearnPack, our interactive engine.';
  return (
    <main className={styles.main}>
      <MktTestimonials
        title="Success stories of our students"
      />
      <MktTrustCards
        title="Trust cards title!"
        description="The current traditional teaching methods focus on theoretical aspects, neglecting hands-on experience and student engagement"
      />
      <MktInfoCards
        subTitle="Learn the science behind 4Geeks"
        title="Mastering Technical Knowledge"
        description={description}
        cardOneIcon="https://storage.googleapis.com/breathecode/logos-technologias/logo-javascript.png"
        cardOneColor="#A4FFBD"
        cardOneTitle="Memory retention"
        cardOneDescription={cardDescription}
        cardTwoIcon="message"
        cardTwoColor="yellow"
        cardTwoTitle="Feedback quality"
        cardTwoDescription={cardDescription}
        cardThreeIcon="code"
        cardThreeColor="#B2E7FF"
        cardThreeTitle="Feedback quality"
        cardThreeDescription={cardDescription}
        cardFourIcon="people"
        cardFourColor="#FFBEBE"
        cardFourTitle="Motivation"
        cardFourDescription={cardDescription}
        paddingMobile="15px"
      />
    </main>
  );
}
