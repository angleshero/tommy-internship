
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AuthorImageFallback from "../../images/author_thumbnail.jpg";
import nftImageFallback from "../../images/nftImage.jpg";

const AuthorItems = ({ id }) => {
  const [authorImage, setAuthorImage] = useState(AuthorImageFallback);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const API_URL = `https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=${id}`;

    const fetchItems = async () => {
      try {
        setLoading(true);

        const res = await fetch(API_URL);
        const data = await res.json();

        setAuthorImage(data?.authorImage || AuthorImageFallback);
        setItems(Array.isArray(data?.nftCollection) ? data.nftCollection : []);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [id]);

  if (!id) return null;

  return (
    <div className="row">
      {items.map((item) => (
        <div key={item.nftId} className="col-lg-3 col-md-6 col-sm-6">
          <div className="nft__item">
            <div className="author_list_pp">
              <Link to={`/author/${id}`}>
                <img
                  src={authorImage}
                  alt=""
                  onError={(e) => (e.currentTarget.src = AuthorImageFallback)}
                />
                <i className="fa fa-check"></i>
              </Link>
            </div>

            <Link to={`/item-details?nftId=${item.nftId}`}>
              <img
                src={item.nftImage || nftImageFallback}
                alt={item.title}
              />
            </Link>

            <div className="nft__item_info">
              <h4>{item.title}</h4>
              <div>{item.price} ETH</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorItems;
