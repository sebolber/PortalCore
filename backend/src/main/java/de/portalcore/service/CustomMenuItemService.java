package de.portalcore.service;

import de.portalcore.entity.CustomMenuItem;
import de.portalcore.repository.CustomMenuItemRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CustomMenuItemService {

    private final CustomMenuItemRepository menuItemRepository;

    public CustomMenuItemService(CustomMenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public List<CustomMenuItem> findByTenant(String tenantId) {
        return menuItemRepository.findByTenantIdOrderBySortOrder(tenantId);
    }

    public List<CustomMenuItem> findTopLevel(String tenantId) {
        return menuItemRepository.findByTenantIdAndParentIdIsNullOrderBySortOrder(tenantId);
    }

    public List<CustomMenuItem> findChildren(String parentId) {
        return menuItemRepository.findByParentIdOrderBySortOrder(parentId);
    }

    public CustomMenuItem findById(String id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Menuepunkt nicht gefunden: " + id));
    }

    @Transactional
    public CustomMenuItem create(CustomMenuItem item, String userId) {
        if (item.getId() == null || item.getId().isBlank()) {
            item.setId("menu-" + UUID.randomUUID().toString().substring(0, 8));
        }
        item.setErstelltVon(userId);
        return menuItemRepository.save(item);
    }

    @Transactional
    public CustomMenuItem update(String id, CustomMenuItem updated, String userId) {
        CustomMenuItem existing = findById(id);
        existing.setLabel(updated.getLabel());
        existing.setIcon(updated.getIcon());
        existing.setMenuType(updated.getMenuType());
        existing.setUrl(updated.getUrl());
        existing.setSortOrder(updated.getSortOrder());
        existing.setVisible(updated.isVisible());
        existing.setParentId(updated.getParentId());
        return menuItemRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        menuItemRepository.deleteById(id);
    }

    @Transactional
    public void updateOrder(List<CustomMenuItem> items) {
        for (int i = 0; i < items.size(); i++) {
            CustomMenuItem item = findById(items.get(i).getId());
            item.setSortOrder(i);
            menuItemRepository.save(item);
        }
    }
}
