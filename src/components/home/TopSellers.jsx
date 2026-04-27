
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/topSellers";

const SKELETON_COUNT = 12;

const TopSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchTopSellers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL);
        

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // Data could be {data: []} or [] depending on API
        const normalized = Array.isArray(data) ? data : data?.data || [];

        if (isMounted) {
          setSellers(normalized);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load top sellers.");
          setSellers([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopSellers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helpers to be resilient to unknown API field names:
  const getName = (item) =>
    item?.authorName ||
    item?.name ||
    item?.username ||
    item?.title ||
    "Unknown Seller";

  const getImage = (item) => item?.authorImage || item?.image || item?.avatar;

  const getEth = (item) =>
    item?.eth || item?.totalEth || item?.totalSales || item?.amount || null;

  return (
    <section id="section-popular" className="pb-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Top Sellers</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          <div className="col-md-12">
            {/* Error state */}
            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
            )}

            <ol className="author_list">
              {/* ✅ Skeleton loading */}
              {loading &&
                new Array(SKELETON_COUNT).fill(0).map((_, index) => (
                  <li key={`skeleton-${index}`} className="skeleton-item">
                    <div className="author_list_pp">
                      <div className="skeleton-avatar" />
                    </div>

                    <div className="author_list_info">
                      <div className="skeleton-line skeleton-line--name" />
                      <div className="skeleton-line skeleton-line--sub" />
                    </div>
                  </li>
                ))}

              {/* ✅ Real API data */}
              {!loading &&
                !error &&
                (sellers?.length ? (
                  sellers.map((seller, index) => (
                    <li key={seller?.id || seller?._id || index}>
                      <div className="author_list_pp">
                        <Link to={`/author/${seller?.id || seller?._id}`}>
                          <img
                            className="lazy pp-author"
                            src={getImage(seller) || AuthorImage}
                            alt={getName(seller)}
                            onError={(e) => {
                              e.currentTarget.src = AuthorImage;
                            }}
                          />
                          <i className="fa fa-check"></i>
                        </Link>
                      </div>

                      <div className="author_list_info">
                        <Link to={`/author/${seller?.id || seller?._id}`}>
                          {getName(seller)}
                        </Link>
                        <span>{seller.price} ETH</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li style={{ padding: "12px 0" }}>
                    <span>No sellers found.</span>
                  </li>
                ))}
            </ol>

           
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSellers;
