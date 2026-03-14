package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.AppUseCase;
import de.portalcore.repository.AppUseCaseRepository;
import de.portalcore.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/apps/{appId}/use-cases")
public class AppUseCaseController {

    private final AppUseCaseRepository appUseCaseRepository;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public AppUseCaseController(AppUseCaseRepository appUseCaseRepository, SecurityHelper securityHelper,
                                AuditService auditService) {
        this.appUseCaseRepository = appUseCaseRepository;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<AppUseCase>> getUseCases(@PathVariable String appId) {
        return ResponseEntity.ok(appUseCaseRepository.findByAppId(appId));
    }

    @PostMapping
    public ResponseEntity<AppUseCase> registerUseCase(
            @PathVariable String appId,
            @Valid @RequestBody AppUseCase useCase) {
        securityHelper.requireSuperAdmin();
        useCase.setAppId(appId);
        if (useCase.getId() == null) {
            useCase.setId("auc-" + UUID.randomUUID().toString().substring(0, 8));
        }
        AppUseCase created = appUseCaseRepository.save(useCase);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "USE_CASE_REGISTRIERT", "Use-Case " + created.getUseCase() + " fuer App " + appId);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{useCaseId}")
    public ResponseEntity<Void> deleteUseCase(
            @PathVariable String appId,
            @PathVariable String useCaseId) {
        securityHelper.requireSuperAdmin();
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "USE_CASE_GELOESCHT", "Use-Case " + useCaseId + " aus App " + appId + " geloescht");
        appUseCaseRepository.deleteById(useCaseId);
        return ResponseEntity.noContent().build();
    }
}
