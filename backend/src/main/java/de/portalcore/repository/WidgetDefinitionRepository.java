package de.portalcore.repository;

import de.portalcore.entity.WidgetDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WidgetDefinitionRepository extends JpaRepository<WidgetDefinition, String> {

    Optional<WidgetDefinition> findByWidgetKey(String widgetKey);

    List<WidgetDefinition> findByAktivTrueOrderByKategorieAscTitelAsc();

    List<WidgetDefinition> findByKategorieAndAktivTrue(String kategorie);

    List<WidgetDefinition> findByAppIdAndAktivTrue(String appId);
}
