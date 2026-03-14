package de.portalcore.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private static abstract class HibernateProxyMixin {
    }

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer hibernateProxyCustomizer() {
        return builder -> builder.mixIn(Object.class, HibernateProxyMixin.class);
    }
}
