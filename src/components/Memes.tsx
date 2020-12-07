import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Meme from "./Meme";
import { Textile } from "../utils/textile";
import { MemeMetadata } from "../utils/Types";

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
`;

const CustomMeme = styled(Meme)`
  margin: 8px 0;
  width: 100%;

  @media screen and (min-width: 768px) {
    width: 60%;
  }
`;

const Memes: React.FC<{}> = () => {
  const [memeMetadata, setMemeMetadata] = useState<Array<MemeMetadata>>([]);
  const [textileInstance, setTextile] = useState<Textile>();

  useEffect(() => {
    const init = async () => {
      const textile = await Textile.getInstance();
      const memes = await textile.getAllMemes();
      setMemeMetadata(memes);
      setTextile(textile);
    };
    init();
  }, []);

  return (
    <Main>
      {memeMetadata &&
        textileInstance &&
        memeMetadata.map(meme => (
          <CustomMeme
            meme={meme}
            textileInstance={textileInstance}
            key={meme.cid}
          />
        ))}
    </Main>
  );
};

export default Memes;
