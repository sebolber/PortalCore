package de.portalcore.service;

import de.portalcore.entity.PortalApp;
import de.portalcore.enums.AppCategory;
import de.portalcore.enums.AppType;
import de.portalcore.enums.AppVendor;
import de.portalcore.enums.MarketSegment;
import de.portalcore.repository.PortalAppRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AppService {

    private final PortalAppRepository portalAppRepository;

    public AppService(PortalAppRepository portalAppRepository) {
        this.portalAppRepository = portalAppRepository;
    }

    public List<PortalApp> findAll() {
        return portalAppRepository.findAll();
    }

    public PortalApp findById(String id) {
        return portalAppRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PortalApp not found with id: " + id));
    }

    @Transactional
    public PortalApp create(PortalApp app) {
        return portalAppRepository.save(app);
    }

    @Transactional
    public PortalApp update(String id, PortalApp updatedApp) {
        PortalApp existing = findById(id);
        existing.setName(updatedApp.getName());
        existing.setShortDescription(updatedApp.getShortDescription());
        existing.setLongDescription(updatedApp.getLongDescription());
        existing.setCategory(updatedApp.getCategory());
        existing.setMarketSegment(updatedApp.getMarketSegment());
        existing.setAppType(updatedApp.getAppType());
        existing.setVendor(updatedApp.getVendor());
        existing.setVendorName(updatedApp.getVendorName());
        existing.setVersion(updatedApp.getVersion());
        existing.setIconColor(updatedApp.getIconColor());
        existing.setIconInitials(updatedApp.getIconInitials());
        existing.setRating(updatedApp.getRating());
        existing.setReviewCount(updatedApp.getReviewCount());
        existing.setInstallCount(updatedApp.getInstallCount());
        existing.setTags(updatedApp.getTags());
        existing.setPrice(updatedApp.getPrice());
        existing.setCompatibility(updatedApp.getCompatibility());
        existing.setFeatured(updatedApp.isFeatured());
        existing.setNew(updatedApp.isNew());
        existing.setRoute(updatedApp.getRoute());
        existing.setRepositoryUrl(updatedApp.getRepositoryUrl());
        existing.setApplicationUrl(updatedApp.getApplicationUrl());
        return portalAppRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!portalAppRepository.existsById(id)) {
            throw new EntityNotFoundException("PortalApp not found with id: " + id);
        }
        portalAppRepository.deleteById(id);
    }

    public List<PortalApp> findByCategory(AppCategory category) {
        return portalAppRepository.findByCategory(category);
    }

    public List<PortalApp> findByMarketSegment(MarketSegment marketSegment) {
        return portalAppRepository.findByMarketSegment(marketSegment);
    }

    public List<PortalApp> findByVendor(AppVendor vendor) {
        return portalAppRepository.findByVendor(vendor);
    }

    public List<PortalApp> search(String term) {
        return portalAppRepository.search(term);
    }

    public List<PortalApp> getRecommendations(String appId) {
        PortalApp app = findById(appId);
        return portalAppRepository.findRecommendations(app.getCategory(), appId);
    }

    public List<PortalApp> findFeatured() {
        return portalAppRepository.findByFeaturedTrue();
    }

    public List<PortalApp> findNew() {
        return portalAppRepository.findByIsNewTrue();
    }

    public List<PortalApp> listApps(AppCategory category, MarketSegment marketSegment,
                                     AppVendor vendor, String search, AppType appType) {
        List<PortalApp> apps = findAll();
        return apps.stream()
                .filter(a -> category == null || a.getCategory() == category)
                .filter(a -> marketSegment == null || a.getMarketSegment() == marketSegment)
                .filter(a -> vendor == null || a.getVendor() == vendor)
                .filter(a -> appType == null || a.getAppType() == appType)
                .filter(a -> search == null || search.isBlank()
                        || a.getName().toLowerCase().contains(search.toLowerCase())
                        || (a.getShortDescription() != null && a.getShortDescription().toLowerCase().contains(search.toLowerCase())))
                .collect(Collectors.toList());
    }

    public Map<MarketSegment, Long> getAppCountPerSegment() {
        Map<MarketSegment, Long> counts = new EnumMap<>(MarketSegment.class);
        List<PortalApp> all = findAll();
        for (MarketSegment segment : MarketSegment.values()) {
            counts.put(segment, all.stream().filter(a -> a.getMarketSegment() == segment).count());
        }
        return counts;
    }
}
