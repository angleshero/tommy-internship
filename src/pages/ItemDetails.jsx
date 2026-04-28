
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import EthImage from "../images/ethereum.svg";
import AuthorImageFallback from "../images/author_thumbnail.jpg";
import nftImageFallback from "../images/nftImage.jpg";

// ---------- helpers ----------
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function pickFirst(obj, keys, fallback) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
}

function formatNumber(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString();
}

function formatEth(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function Skeleton({ className = "", style = {} }) {
  return <div className={`skel ${className}`} style={style} />;
}

const ItemDetails = () => {
  const query = useQuery();

  // ✅ Silent fallback (no warning banner)
  const nftId = query.get("nftId") || "17914494";

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");
        setItem(null);

        const url = `https://us-central1-nft-cloud-functions.cloudfunctions.net/itemDetails?nftId=${encodeURIComponent(
          nftId
        )}`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const data = await res.json();
        setItem(data);
      } catch (e) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "Failed to load item details.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [nftId]);

  const onRetry = () => {
    setLoading(true);
    setError("");
    setItem(null);
  };

  // ---------- mapped data ----------
  const title = pickFirst(item, ["title", "name", "nftName"], `NFT #${nftId}`);
  const description = pickFirst(
    item,
    ["description", "desc", "nftDescription"],
    "No description provided."
  );

  const imageUrl = pickFirst(
    item,
    ["image", "imageUrl", "nftImage", "thumbnail"],
    nftImageFallback
  );

  const views = pickFirst(item, ["views", "viewCount"], 0);
  const likes = pickFirst(item, ["likes", "likeCount"], 0);
  const priceEth = pickFirst(item, ["price", "ethPrice", "priceEth"], null);

  const owner = pickFirst(item, ["owner", "ownerInfo"], {});
  const ownerName = pickFirst(owner, ["ownerName", "username"], "Unknown Owner");
  const ownerId = pickFirst(owner, ["ownerId", "authorId"], "");
  const ownerAvatar = pickFirst(
    owner,
    ["ownerAvatar", "avatar", "profileImage"],
    AuthorImageFallback
  );

  const creator = pickFirst(item, ["creator", "creatorInfo"], {});
  const creatorName = pickFirst(creator, ["creatorName"], "Unknown Creator");
  const creatorId = pickFirst(creator, ["creatorId"], "");
  const creatorAvatar = pickFirst(
    creator,
    ["creatorAvatar", "creatorImage"],
    AuthorImageFallback
  );

  const authorLink = (id) => (id ? `/author?author=${id}` : "/author");

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <section className="mt90 sm-mt-0">
          <div className="container">
            {error && (
              <div className="alert alert-danger">
                <strong>Error:</strong> {error}
                <button className="btn btn-primary ml-3" onClick={onRetry}>
                  Retry
                </button>
              </div>
            )}

            <div className="row">
              {/* IMAGE */}
              <div className="col-md-6 text-center">
                {loading ? (
                  <Skeleton className="skel-image" />
                ) : (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="img-rounded"
                    onError={(e) => (e.currentTarget.src = nftImageFallback)}
                  />
                )}
              </div>

              {/* DETAILS */}
              <div className="col-md-6">
                <div className="item_info">
                  {loading ? (
                    <Skeleton className="skel-line" style={{ height: 32 }} />
                  ) : (
                    <>
                      <h2>{title}</h2>

                      <div className="item_info_counts">
                        <div>
                          <i className="fa fa-eye"></i> {formatNumber(views)}
                        </div>
                        <div>
                          <i className="fa fa-heart"></i> {formatNumber(likes)}
                        </div>
                      </div>

                      <p>{description}</p>
                    </>
                  )}

                  {/* OWNER */}
                  <h6>Owner</h6>
                  <Link to={authorLink(ownerId)} className="item_author">
                    <img
                      src={ownerAvatar}
                      alt={ownerName}
                      className="author_list_pp"
                      onError={(e) => (e.currentTarget.src = AuthorImageFallback)}
                    />
                    <span>{ownerName}</span>
                  </Link>

                  {/* CREATOR */}
                  <h6 className="mt-3">Creator</h6>
                  <Link to={authorLink(creatorId)} className="item_author">
                    <img
                      src={creatorAvatar}
                      alt={creatorName}
                      className="author_list_pp"
                      onError={(e) => (e.currentTarget.src = AuthorImageFallback)}
                    />
                    <span>{creatorName}</span>
                  </Link>

                  {/* PRICE */}
                  <h6 className="mt-3">Price</h6>
                  <div className="nft-item-price">
                    <img src={EthImage} alt="ETH" />
                    <span>{priceEth == null ? "—" : formatEth(priceEth)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ItemDetails;
