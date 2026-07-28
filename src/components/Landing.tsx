import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { usePortfolio } from "../context/PortfolioContext";

const Landing = ({ children }: PropsWithChildren) => {
  const { config } = usePortfolio();
  const nameParts = config.developer.fullName.split(" ");
  const firstName = nameParts[0] || config.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {firstName.toUpperCase()}
              {' '}
              <br />
              {lastName && <span>{lastName.toUpperCase()}</span>}
            </h1>
          </div>
          <div className="landing-info">
            <h3>An</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">Full-Stack Web + AI</div>
            </h2>
            <h2>
              <div className="landing-h2-info">Software Developer</div>
            </h2>
          </div>
          {/* Mobile photo - shows only on mobile when 3D character is hidden */}
          <div className="mobile-photo">
            <img src="/images/mypicnbg.png" alt="Rushaan Shahid" />
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
