
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import AuthorImageFallback from "../images/author_thumbnail.jpg";

const DEFAULT_AUTHOR_ID = 73855012;

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const Author = () => {
  const query = useQuery();

  // ✅ Works with your current route:
  // /author?author=73855012
  const authorId = query.get("author") || String(DEFAULT_AUTHOR_ID);

  const API_URL = `https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=${authorId}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [author, setAuthor] = useState(null);

  // Follow UI state
  const [isFollowed, setIsFollowed] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchAuthor = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (isMounted) {
          setAuthor(data && typeof data === "object" ? data : null);

          // Seed follow count per author load
          const baseFollowers = Number(data?.followers ?? 0) || 0;
          setFollowersCount(baseFollowers);
          setIsFollowed(false);
        }
      } catch (err) {
        if (isMounted && err.name !== "AbortError") {
          console.error(err);
          setError(err?.message || "Failed to load author.");
          setAuthor(null);
          setFollowersCount(0);
          setIsFollowed(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAuthor();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [API_URL]);

  // ✅ Follow toggles +1 then -1 (never below 0)
  const onToggleFollow = (e) => {
    e.preventDefault(); // because the button is inside a Link-like area
    setIsFollowed((prev) => {
      setFollowersCount((count) => (prev ? Math.max(0, count - 1) : count + 1));
      return !prev;
    });
  };

  const authorName = author?.authorName || (loading ? "Loading..." : "Unknown Author");
  const tag = author?.tag ? `@${author.tag}` : "";
  const address = author?.address || "";
  const authorImage = author?.authorImage || AuthorImageFallback;

  // Copy wallet to clipboard
  const onCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      // optional: toast/alert
      // alert("Copied!");
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          id="profile_banner"
          aria-label="section"
          className="text-light"
          data-bgimage="url(images/author_banner.jpg) top"
          style={{ background: `url(${AuthorBanner}) top` }}
        ></section>

        <section aria-label="section">
          <div className="container">
            {/* Error message */}
            {error && !loading ? (
              <div className="row">
                <div className="col-md-12">
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="row">
              <div className="col-md-12">
                <div className="d_profile de-flex">
                  <div className="de-flex-col">
                    <div className="profile_avatar">
                      <img
                        src={authorImage}
                        alt={authorName}
                        onError={(e) => {
                          e.currentTarget.src = AuthorImageFallback;
                        }}
                      />

                      <i className="fa fa-check"></i>

                      <div className="profile_name">
                        <h4>
                          {authorName}
                          {tag ? <span className="profile_username">{tag}</span> : null}

                          {/* wallet */}
                          {address ? (
                            <span id="wallet" className="profile_wallet">
                              {address}
                            </span>
                          ) : null}

                          <button id="btn_copy" title="Copy Text" onClick={onCopy}>
                            Copy
                          </button>
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Follow panel (top-right) */}
                  <div className="profile_follow de-flex">
                    <div className="de-flex-col">
                      <div className="profile_follower">
                        {loading ? "Loading..." : `${followersCount} followers`}
                      </div>

                      {/* Keep Link styling but make it behave like a button */}
                      <Link to="#" className="btn-main" onClick={onToggleFollow}>
                        {isFollowed ? "Following" : "Follow"}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs / AuthorItems */}
              <div className="col-md-12">
                <div className="de_tab tab_simple">
                  {/* Option A: Leave AuthorItems to fetch itself */}
                  <AuthorItems />

                  {/* Option B (recommended): pass authorId so AuthorItems fetches the SAME author
                      <AuthorItems authorId={authorId} />
                  */}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;

