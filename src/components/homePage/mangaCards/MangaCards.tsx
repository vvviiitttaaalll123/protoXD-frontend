import { useEffect, useState } from "react";
import { instance } from "../../../axiosInstance";
import {
  COVER_URL,
  GET_RECENTLY_UPDATED,
  IMAGE_URL,
} from "../../../constants/AllUrls";
import MangaCard from "../mangaCard/MangaCard";
import styles from "./MangaCards.module.scss";
import { ObjectTemplate, RecentlyUpdatedType } from "./MangaTypes";

const MangaCards = () => {
  const url = GET_RECENTLY_UPDATED;
  const [getRecentlyUpdatedData, setGetRecentlyUpdatedData] =
    useState<RecentlyUpdatedType>();
  const [interMediateBufferObject, setInterMediateBufferObject] = useState<
    ObjectTemplate[]
  >([]);

  useEffect(() => {
    const initRecentlyUpdatedData = async () => {
      try {
        const res = await instance.get(url);
        return res.data;
      } catch (err) {
        console.log(err);
      }
    };

    initRecentlyUpdatedData().then((res) => setGetRecentlyUpdatedData(res));
  }, []);

  useEffect(() => {
    const populateRequiredValues = async (getData: RecentlyUpdatedType) => {
      let res: ObjectTemplate[] = [];
      await Promise.all(
        getData?.data.map(async (elem) => {
          const temp: ObjectTemplate = {
            imageUrl: "",
            mangaId: "",
            mangaName: elem.attributes.title,
            scannerName: "",
            chapter: "",
            id: "",
            updatedAt: "",
          };

          for (let relation of elem.relationships) {
            if (relation.type === "manga") {
              temp.mangaId = relation.id;
              try {
                const response = await instance.get(
                  COVER_URL + `?manga_id=${temp.mangaId}`
                );
                temp.imageUrl = response.data.data[0].attributes.fileName;
              } catch (err) {
                console.log(err);
              }
            }

            if (relation.type.match("[A-Za-z_]*group")) {
              temp.scannerName = relation.attributes.name
                ? relation.attributes.name
                : "";
            }
            temp.chapter = elem.attributes.chapter;
            temp.id = relation.id + " " + elem.id;
            temp.updatedAt = relation.attributes?.updatedAt;
          }

          res.push(temp);
        })
      );
      return res;
    };

    if (getRecentlyUpdatedData && getRecentlyUpdatedData.data) {
      populateRequiredValues(getRecentlyUpdatedData).then((res) => {
        setInterMediateBufferObject(res);
      });
    }
  }, [getRecentlyUpdatedData]);

  return (
    <>
      {interMediateBufferObject && interMediateBufferObject.length > 0 && (
        <p className="container text-white pt-3 pb-3 text-3xl">UPDATED</p>
      )}
      <div className={"container " + styles.container}>
        {interMediateBufferObject.map((elem) => {
          return (
            <MangaCard
              imageSrc={
                IMAGE_URL +
                `?manga_id=${elem.mangaId}&image_url=${elem.imageUrl}`
              }
              chapterNumber={elem.chapter}
              mangaTitle={elem.mangaName}
              scannerName={elem.scannerName}
              time={elem.updatedAt}
              key={elem.id}
              mangaId={elem.mangaId}
            />
          );
        })}
      </div>
    </>
  );
};

export default MangaCards;
