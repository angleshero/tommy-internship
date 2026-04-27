
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import AuthorImageFallback from "../../images/author_thumbnail.jpg";
import nftImageFallback from "../../images/nftImage.jpg";

const AuthorItems = ({ author, nfts, loading }) => {
  const skeletonCards = useMemo(() => new Array(8).fill(0), []);

  const authorId = author?.authorId;
  const authorImage = author?.authorImage || AuthorImageFallback;

  if (loading) {
    return (
      <div className="row">
        {skeletonCards.map((_, i) => (
          <div key={i} className="col-lg-3 col-md-6 col-sm-6 col-xs-12">
            <div className="nft__item">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div className="skeleton skeleton-circle-sm" />
                <div className="skeleton skeleton-line" style={{ width: "60%" }} />
              </div>

              <div className="skeleton skeleton-rect" />

              <div style={{ marginTop: 12 }}>
                <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                  <div className="skeleton skeleton-line" style={{ width: "35%" }} />
                  <div className="skeleton skeleton-line" style={{ width: "25%" }} />
                </div>
              </div>
            </div>
          </div>
        ))}

        <style>
          {`
            .skeleton {
              background: linear-gradient(
                90deg,
                rgba(255,255,255,0.06) 25%,
                rgba(255,255,255,0.14) 37%,
                rgba(255,255,255,0.06) 63%
              );
              background-size: 400% 100%;
              animation: shimmer 1.2s ease-in-out infinite;
              border-radius: 10px;
            }
            .skeleton-circle-sm {
              width: 32px;
              height: 32px;
              border-radius: 999px;
              flex: 0 0 auto;
            }
            .skeleton-rect {
              width: 100%;
              height: 200px;
              border-radius: 12px;
            }
            .skeleton-line {
              height: 14px;
              border-radius: 8px;
            }
            @keyframes shimmer {
              0% { background-position: 100% 0; }
              100% { background-position: 0 0; }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="row">
      {(nfts || []).map((nft, index) => {
        const key = nft?.nftId ?? nft?.id ?? index;
        const title = nft?.title || "Untitled";
        const price = nft?.price ?? "—";
        const likes = nft?.likes ?? 0;
        const image = nft?.nftImage || nftImageFallback;

        return (
          <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={key}>
            <div className="nft__item">
              {/* ✅ Author icon on every card */}
              <div className="author_list_pp" style={{ marginBottom: 10 }}>
                {/* Clicking this should route to the authorId URL */}
                <Link to={authorId ? `/author/${authorId}` : "#"} title="View author">
                  <img
                    src={authorImage}
                    alt="Author"
                    style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                    onError={(e) => (e.currentTarget.src = AuthorImageFallback)}
                  />
                  <i className="fa fa-check"></i>
                </Link>
              </div>

              <div className="nft__item_wrap">
                <Link to={`/item-details/${nft?.nftId ?? ""}`}>
                  <img
                    src={image}
                    className="lazy nft__item_preview"
                    alt={title}
                    onError={(e) => (e.currentTarget.src = nftImageFallback)}
                  />
                </Link>
              </div>

              <div className="nft__item_info">
                <Link to={`/item-details/${nft?.nftId ?? ""}`}>
                  <h4>{title}</h4>
                </Link>

                <div className="nft__item_price">{`${price} ETH`}</div>

                <div className="nft__item_like">
                  <i className="fa fa-heart"></i>
                  <span>{likes}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AuthorItems;
``
