import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Meme from "../components/Meme";
import Loader from "../components/Loader";
import { Textile } from "../utils/textile";
import { MemeMetadata } from "../utils/Types";

const Main = styled.div`
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  flex: 1;
  overflow: auto;
`;

const CustomMeme = styled(Meme)`
  margin: 8px 0;
  width: 100%;

  @media screen and (min-width: 768px) {
    width: 60%;
  }
`;

const Home: React.FC<{}> = () => {
  const [memeMetadata, setMemeMetadata] = useState<Array<MemeMetadata>>([]);
  const [textileInstance, setTextile] = useState<Textile>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const textile = await Textile.getInstance();
      const memes = await textile.getAllMemes();
      setMemeMetadata(memes.sort((meme1, meme2) => meme2.likes - meme1.likes));
      setTextile(textile);
      setLoading(false);
    };
    init();
  }, []);

  return (
    <Main>
      {loading && <Loader />}
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

export default Home;
