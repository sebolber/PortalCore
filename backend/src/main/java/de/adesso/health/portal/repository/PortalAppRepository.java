package de.adesso.health.portal.repository;

import de.adesso.health.portal.entity.PortalApp;
import de.adesso.health.portal.enums.AppCategory;
import de.adesso.health.portal.enums.AppVendor;
import de.adesso.health.portal.enums.MarketSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortalAppRepository extends JpaRepository<PortalApp, String> {

    List<PortalApp> findByCategory(AppCategory category);

    List<PortalApp> findByMarketSegment(MarketSegment marketSegment);

    List<PortalApp> findByVendor(AppVendor vendor);

    @Query("SELECT a FROM PortalApp a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :term, '%')) " +
           "OR LOWER(a.shortDescription) LIKE LOWER(CONCAT('%', :term, '%')) " +
           "OR LOWER(a.tags) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<PortalApp> search(@Param("term") String term);

    List<PortalApp> findByFeaturedTrue();

    List<PortalApp> findByIsNewTrue();

    @Query("SELECT a FROM PortalApp a WHERE a.category = :category AND a.id <> :appId ORDER BY a.rating DESC")
    List<PortalApp> findRecommendations(@Param("category") AppCategory category, @Param("appId") String appId);
}
