package de.portalcore.controller;

import de.portalcore.entity.AppUseCase;
import de.portalcore.repository.AppUseCaseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/apps/{appId}/use-cases")
public class AppUseCaseController {

    private final AppUseCaseRepository appUseCaseRepository;

    public AppUseCaseController(AppUseCaseRepository appUseCaseRepository) {
        this.appUseCaseRepository = appUseCaseRepository;
    }

    @GetMapping
    public ResponseEntity<List<AppUseCase>> getUseCases(@PathVariable String appId) {
        return ResponseEntity.ok(appUseCaseRepository.findByAppId(appId));
    }

    @PostMapping
    public ResponseEntity<AppUseCase> registerUseCase(
            @PathVariable String appId,
            @RequestBody AppUseCase useCase) {
        useCase.setAppId(appId);
        if (useCase.getId() == null) {
            useCase.setId("auc-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return ResponseEntity.ok(appUseCaseRepository.save(useCase));
    }

    @DeleteMapping("/{useCaseId}")
    public ResponseEntity<Void> deleteUseCase(
            @PathVariable String appId,
            @PathVariable String useCaseId) {
        appUseCaseRepository.deleteById(useCaseId);
        return ResponseEntity.noContent().build();
    }
}
